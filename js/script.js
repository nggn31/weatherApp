const apiKey = `02d00fa752972250bfbd2fa2534baeff`;

function getWeather(cityname) {
    // Verificar si el nombre de la ciudad está vacío
    if (cityname === "") {
        console.error('Por favor, ingresa una ciudad');
        return;
    }

    return fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${apiKey}&units=metric`)
        .then(response => response.json())
        .catch(error => {
            console.error('Error al obtener el clima:', error);
        });
}

// Mostrar el clima de una ciudad ingresada y guardarla
function showCityWeather() {
    const cityname = document.getElementById("cityname").value;
    const resultCity = document.querySelector(".weather");

    getWeather(cityname).then(data => {
        // Si hay datos de clima, se muestran
        if (data && data.main) {
            resultCity.innerHTML = `El clima en ${cityname} es ${data.main.temp}°C con ${data.weather[0].description}.`;

            // Desactivar el formulario
            document.getElementById("search-form").style.display = "none"; // Ocultar el formulario

            // Guardar la ciudad en localStorage
            let savedCities = JSON.parse(localStorage.getItem('cities')) || [];
            if (!savedCities.includes(cityname)) {
                savedCities.push(cityname);
                localStorage.setItem('cities', JSON.stringify(savedCities));
            }
        } else {
            // Si no hay datos válidos, mostrar un mensaje
            resultCity.innerHTML = "Ciudad no encontrada.";
        }
    });
}

// Enviar el formulario de búsqueda
document.getElementById("search-form").addEventListener("submit", (event) => {
    event.preventDefault();
    showCityWeather();
});

// Botón eliminar ciudades guardadas
document.getElementById("deleteCity").addEventListener("click", (event) => {
    event.preventDefault();
    localStorage.removeItem('cities');
    const resultCity = document.querySelector(".weather");
    resultCity.innerHTML = "";
});

// Mostrar el clima de las ciudades guardadas al cargar la página
window.onload = () => {
    const savedCities = JSON.parse(localStorage.getItem('cities')) || [];
    
    savedCities.forEach(city => {
        getWeather(city).then(data => {
            const resultCity = document.querySelector(".weather");
            resultCity.innerHTML += `Bienvenido, el clima en ${city} es ${data.main.temp}°C con ${data.weather[0].description}.<br>`;
        });
    });

    showDefaultCities();
    findHottestCity(); 
};

// Enviar el formulario para agregar una ciudad por defecto
document.getElementById("addDefaultCities").addEventListener("submit", (event) => {
    event.preventDefault(); // Prevenir que se recargue la página
    
    const cityname = document.getElementById("defaultCitiesName").value; // Obtener el nombre de la ciudad
    
    // Verificar si el input tiene un valor
    if (cityname) {
        let defaultCities = JSON.parse(localStorage.getItem('defaultCities')) || [];
        
        // Agregar la ciudad si no está en el arreglo
        if (!defaultCities.includes(cityname)) {
            defaultCities.push(cityname);
            localStorage.setItem('defaultCities', JSON.stringify(defaultCities));
            showDefaultCities(); // Actualizar la lista de ciudades
        } else {
            alert("La ciudad ya está agregada.");
        }
    } else {
        alert("Por favor, ingresa una ciudad.");
    }
    
    document.getElementById("defaultCitiesName").value = ''; // Limpiar el input después de agregar la ciudad
});

// Eliminar todas las ciudades por defecto
document.getElementById("deleteDefaultCities").addEventListener("click", () => {
    localStorage.removeItem('defaultCities');
    showDefaultCities(); // Actualizar la lista de ciudades
});

// Mostrar las ciudades por defecto agregadas por el usuario
function showDefaultCities() {
  const defaultCities = JSON.parse(localStorage.getItem('defaultCities')) || [];
  const resultDefaultCities = document.querySelector(".defaultCities");

  // Limpiar el contenido previo
  resultDefaultCities.innerHTML = '';

  // Si no hay ciudades, mostrar un mensaje
  if (defaultCities.length === 0) {
      resultDefaultCities.innerHTML = "No hay ciudades por defecto agregadas.";
      return;
  }

  const weatherPromises = defaultCities.sort().map(city => {
      return getWeather(city).then(data => {
          // Determinar el icono según el clima
          let weatherClass = '';
          if (data.weather[0].main.toLowerCase() === 'clear') {
              weatherClass = 'sunny';
          } else if (data.weather[0].main.toLowerCase() === 'clouds') {
              weatherClass = 'cloudy';
          } else if (data.weather[0].main.toLowerCase() === 'rain') {
              weatherClass = 'rainy';
          } else if (data.weather[0].main.toLowerCase() === 'storm') {
              weatherClass = 'stormy';
          } else if (data.weather[0].main.toLowerCase() === 'snow') {
              weatherClass = 'snowy';
          }

          // Mostrar la temperatura y el clima
          return `
              <div class="card ${weatherClass}">
                  <div class="card-body position-relative">
                      <h5 class="card-title">${city}</h5>
                      <img src="http://openweathermap.org/img/wn/${data.weather[0].icon}.png" alt="Weather Icon" style="width: 50px; height: 50px;"/>
                      <p class="card-text">Temperatura: ${data.main.temp}°C</p>
                      <p class="card-text">${data.weather[0].description}</p>
                      <span onclick="deleteCity('${city}')" class="close" style="position: absolute; top: 10px; right: 10px; cursor: pointer; font-size: 20px;">&times;</span>
                  </div>
              </div>
          `;
      }).catch(error => {
          console.error(`Error al obtener el clima para ${city}:`, error);
          return `
              <div class="card">
                  <div class="card-body">
                      <h5 class="card-title">${city}</h5>
                      <p>Error al obtener el clima para esta ciudad.</p>
                      <span onclick="deleteCity('${city}')" class="close" style="position: absolute; top: 10px; right: 10px; cursor: pointer; font-size: 20px;">&times;</span>
                  </div>
              </div>
          `;
      });
  });

  // Esperar a que todas las promesas se resuelvan y actualizar el DOM
  Promise.all(weatherPromises).then(weatherHTML => {
      resultDefaultCities.innerHTML = weatherHTML.join('');
      findHottestCity(); 
  });
}

// Función para eliminar una ciudad por defecto
function deleteCity(city) {
    let defaultCities = JSON.parse(localStorage.getItem('defaultCities')) || [];
    defaultCities = defaultCities.filter(c => c !== city);
    localStorage.setItem('defaultCities', JSON.stringify(defaultCities));
    showDefaultCities(); // Actualizar la lista
}

// Función para encontrar la ciudad más caliente a partir de las ciudades por defecto
function findHottestCity() {
    const defaultCities = JSON.parse(localStorage.getItem('defaultCities')) || [];

    // Verificar si hay ciudades por defecto
    if (defaultCities.length === 0) {
        document.getElementById("hottestCityDisplay").innerText = "No hay ciudades guardadas.";
        return;
    }

    let hottestCity = "";
    let maxTemperature = -100; // Valor inicial bajo para comparar temperaturas
    let processedCities = 0; // Contador de ciudades procesadas

    // Obtener la temperatura de cada ciudad
    defaultCities.forEach(city => {
        getWeather(city).then(data => {
            processedCities++; // Incrementar el contador de ciudades procesadas

            if (data && data.cod === 200) { // Asegurarse de que la ciudad es válida
                if (data.main.temp > maxTemperature) {
                    maxTemperature = data.main.temp;
                    hottestCity = city;
                }
            }
            
            // Al finalizar todas las promesas, mostrar la ciudad más caliente
            if (processedCities === defaultCities.length) {
                if (hottestCity) {
                    document.getElementById("hottestCityDisplay").innerText = `La ciudad más caliente es ${hottestCity} con ${maxTemperature}°C.`;
                } else {
                    document.getElementById("hottestCityDisplay").innerText = "No se pudo determinar la ciudad más caliente.";
                }
            }
        });
    });
}