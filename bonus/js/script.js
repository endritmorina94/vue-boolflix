
var app = new Vue(
    {
        el: '#root',
        data: {
            key: "99d1efa101b179fd70c80c694373d975",
            query: "",
            movies: [],
            series: [],
            // Bandiere disponibili
            languages: ["en", "de", "it", "fr", "ru"],
            newEntries: [],
            preloadedMovies: [],
            genres: [
                {
                    name: "Action",
                    isActive: false
                },
                {
                    name: "Adventure",
                    isActive: false
                },
                {
                    name: "Comedy",
                    isActive: false
                },
                {
                    name: "Science Fiction",
                    isActive: false
                },
                {
                    name: "Thriller",
                    isActive: false
                }
            ],
            activeCard: 1,
            indexOfGen: -1,
            genreChoosen: false,
            scroll: parseInt(getComputedStyle(document.getElementById("carosello")).right)
        },
        methods: {
            //Funzioni Slider
            checkIfCentered(ind) {
                if(ind == 1){
                    return true;
                } else {
                    return false;
                }
            },
            checkIfNextToActive(ind) {
                if(ind == (this.activeCard + 1)) {
                    return true;
                } else {
                    return false;
                }
            },
            nextPrev(index) {
                if(index != this.activeCard){
                    const carousel = document.getElementById("carosello");
                    const slideWidth = document.querySelectorAll('.card')[this.activeCard].clientWidth;

                    console.log(slideWidth);
                    console.log(carousel);
                    console.log(this.scroll);

                    if( index > this.activeCard){
                        this.scroll += slideWidth;

                        carousel.style.left = `${-this.scroll}px`;
                        this.activeCard += 1;
                        console.log(this.activeCard);
                        console.log(index);

                        if (index > this.newEntries.length - 1){
                            this.activeCard = 1;
                            carousel.style.left = "0px";
                            this.scroll = parseInt(getComputedStyle(document.getElementById("carosello")).right);

                            console.log(this.activeCard);
                            console.log(index);
                        }
                    } else {
                        this.scroll -= slideWidth;

                        carousel.style.left = `-${this.scroll}px`;
                        this.activeCard -= 1;
                        if (this.activeCard == 0){
                            carousel.style.marginLeft = `${slideWidth}px`;
                            this.scroll = parseInt(getComputedStyle(document.getElementById("carosello")).right);
                        }
                    }

                }

            },
            // Fine Funzioni Slider

            toggleActive(ind) {
                this.genres.forEach((item) => {
                    item.isActive = false;
                });

                // this.genres[ind].isActive = !this.genres[ind].isActive;

                if (this.genres[ind].isActive == false){
                    this.genres[ind].isActive = true;
                    this.indexOfGen = ind;
                }else {
                    this.genres[ind].isActive = false;
                    this.indexOfGen = -1;ùù
                }

                console.log(this.indexOfGen);
            },

            //Questa funzione chiama la ricerca, restituendo i risultati dell'API all'interno dei nostri array movies e series
            search() {
                //Prima chiamata per i film
                axios
                    .get("https://api.themoviedb.org/3/search/multi?", {
                        params:
                        { api_key : this.key,
                          query : this.query,
                          page : 1
                        }
                    }).then((response) => {
                        //Metto in una variabile i film
                        let result = response.data.results;

                        //Filtro quelli senza poster e con bandiera diversa da quelle disponibili
                        result = this.filterEmptyFields(result);
                        //Cambio il voto da decimi a quinti
                        this.splitVote(result);
                        //Aggiungo i generi e i primi 5 attori del cast
                        this.addGenresAndCredits(result, "movie");
                        //Passo il tutto all'array movies
                        this.movies= result;
                    });

                //Seconda chiamata per le serie (tutto quello che abbiamo fatto sopra ma con le serie)
                axios
                    .get("https://api.themoviedb.org/3/search/tv?", {
                        params:
                        { api_key : this.key,
                          query : this.query,
                          page : 1
                        }
                    }).then((response) => {
                        let result = response.data.results;

                        result = this.filterEmptyFields(result);
                        this.splitVote(result);
                        this.addGenresAndCredits(result, "tv");
                        this.series = result;
                    });
            },

            //Questa funzione fa una chiamata axios per ogni film trovato e ne aggiunge i primi 5 oggetti del cast e i generi
            //moviesOrSeriesArray ==> è l'array di film o serie
            //type ==> è una stringa con il tipo di ricerca che andremo a fare: "movie" o "tv"
            addGenresAndCredits(moviesOrSeriesArray, type){
                //Ciclo tutit gl'elementi dell'array usando il loro id per fare la chiamata axios
                moviesOrSeriesArray.forEach((element) => {
                    axios
                        .get("https://api.themoviedb.org/3/" + type + "/" + element.id + "?", {
                            params:
                            {
                                api_key : this.key,
                                append_to_response : "credits"
                            }
                            //Della risposta prenderemo i primi 5 oggetti del cast e aggiugneremo i generi
                        }).then((response) => {

                            //Settiamo un array cast e lo popoliamo con i primi 5 nomi del cast
                            Vue.set(element, 'cast', response.data.credits.cast.slice(0, 5));

                            //Settiamo un array vuoto chiamato genres per i generi
                            Vue.set(element, 'genres', []);
                            // Cicliamo i generi e li pushiamo nell'array vuoto
                            response.data.genres.forEach((item) => {
                                element.genres.push(item.name);
                            });

                            console.log(element);
                        });
                });
            },

            //Questa funzione filtra i risultati con lingua diversa dalle bandiere disponibili e i risultati senza poster path
            filterEmptyFields(array) {
                return array.filter((element) => this.languages.includes(element.original_language) && element.poster_path != null);
            },

            //Questa funzione divide il voto del film o della serie per due e lo arrotonda
            splitVote(array) {
                array.forEach((element) => {
                    element.vote_average = Math.round(element.vote_average / 2);
                });
            }

        },
        mounted() {

            axios
                .get("https://api.themoviedb.org/3/movie/upcoming?", {
                    params:
                    {
                        api_key : this.key,
                        language : "it-IT",
                        page: 1
                    }
                    //Della risposta prenderemo i primi 5 oggetti del cast e aggiugneremo i generi
                }).then((response) => {

                    const result = response.data.results.slice(0, 10);

                    this.splitVote(result);

                    this.addGenresAndCredits(result, "movie");

                    this.newEntries = result;

                    console.log(this.newEntries);

                });

                // Creo un array con 30 film Top Rated
                for (let i = 1; i < 4; i++) {
                    axios
                        .get("https://api.themoviedb.org/3/movie/top_rated?", {
                            params:
                            {
                                api_key : this.key,
                                language : "it-IT",
                                page: this.i
                            }
                            //Della risposta prenderemo i primi 5 oggetti del cast e aggiugneremo i generi
                        }).then((response) => {

                            const result = response.data.results.slice(0, 10);

                            this.splitVote(result);

                            this.addGenresAndCredits(result, "movie");

                            result.forEach((item) => {

                                this.preloadedMovies.push(item);
                            });

                        });

                        console.log(this.preloadedMovies);
                }
        }
    }
);
