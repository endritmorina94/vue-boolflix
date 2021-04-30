var app = new Vue(
    {
        el: '#root',
        data: {
            key: "99d1efa101b179fd70c80c694373d975",
            query: "",
            movies: [],
            series: [],
            movieIds : [],
            // Bandiere disponibili
            languages: ["en", "de", "it", "fr", "ru"]
        },
        methods: {
            //Questa funzione chiama la ricerca, restituendo i risultati dell'API all'interno dei nostri array movies e series
            search() {
                //Prima chiamata per i film
                axios
                    .get("https://api.themoviedb.org/3/search/movie?", {
                        params:
                        { api_key : this.key,
                          query : this.query,
                          page : 1
                        }
                    }).then((response) => {
                        let result = response.data.results;

                        result = this.filterEmptyFields(result);
                        this.splitVote(result);
                        this.addGenresAndCredits(result, "movie");
                        this.movies= result;

                        console.log(this.movies);
                    });

                //Seconda chiamata per le serie
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
                        console.log(result);
                    });
            },

            addGenresAndCredits(array, type){
                array.forEach((element) => {
                    axios
                        .get("https://api.themoviedb.org/3/" + type + "/" + element.id + "?", {
                            params:
                            {
                                api_key : this.key,
                                append_to_response : "credits",
                                language : "it-IT"
                            }
                        }).then((response) => {
                            element.cast = response.data.credits.cast.slice(0, 5);
                            element.genres = [];
                            response.data.genres.forEach((item) => {
                                element.genres.push(item.name);
                            });
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

        }
    }
);
