$(document).ready(function() {
    $('.js-example-basic-single').select2();

    //      inicia o mapa
    const map = L.map('map').setView([-5.19422, -45.56029], 6);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //      armazena os marcadores
    const markers = {};

    //       marcadores no mapa
    function addMarkers(destinations) {
        destinations.forEach(dest => {
            const marker = L.marker([dest.latitude, dest.longitude]).addTo(map)
                .bindPopup(`<b>${dest.name}</b><br>${dest.region}`)
                .on('click', () => showDetails(dest));
            markers[dest.id] = marker;
        });
    }

    //       detalhes do destino
    function showDetails(dest) {
    //       busca os detalhes ao clicar no destino   
         $.get(`https://guia-maranhao.vercel.app/destinations/${dest.id}`, function(selectedDestination) {
             $('#details').html(`
                 <h2 class="text-center">${selectedDestination.name}</h2>
                 <div id="carouselExample" class="slick-carousel">
                    ${selectedDestination.photos.map(photo => `<div><img src="imagens/${photo}" class="d-block w-100" alt="Foto de ${selectedDestination.name}"></div>`).join('')}
                </div>
                 <p>${selectedDestination.description}</p>
                <p><strong>Melhor período para visitar:</strong> ${selectedDestination.bestPeriod}</p>
                 <h3 class="atrativosC">Atrativos</h3>
                <ul id="atrativosList"></ul>
            `);

     //        atrativo do destinno
            $.get(`https://guia-maranhao.vercel.app/destinations/${selectedDestination.id}/atrativos`, function(atrativos) {
                $('#atrativosList').html(
                    atrativos.map(atrativo => `
                        <li class="atrativo-item">
                            <strong>${atrativo.name}</strong> (${atrativo.type}): ${atrativo.description}. 
                            <br>
                            <strong>Dicas:</strong> ${atrativo.tips}
                        </li>
                    `).join('')
                );
            });

    //         carrossel 
            $('.slick-carousel').slick({
                autoplay: true,
                autoplaySpeed: 1500,
                dots: true
            });
        });
    }

    //         select 2
    function populateSelect(destinations) {
        destinations.forEach(dest => {
            $('#search').append(new Option(dest.name, dest.id));
        });
    }

    //          funcao de buscar
    $('#searchButton').on('click', () => {
        const selectedId = $('#search').val();
        $.get(`https://guia-maranhao.vercel.app/destinations/${selectedId}`, function(selectedDestination) {
            if (selectedDestination) {

                showDetails(selectedDestination);
                map.setView([selectedDestination.latitude, selectedDestination.longitude], 14);
                markers[selectedId].openPopup();
                
            }
        });
    });

    // carrega os destinos ao iniciar
    $.get('https://guia-maranhao.vercel.app/destinations', function(destinations) {
        populateSelect(destinations);
        addMarkers(destinations);
    });
});
