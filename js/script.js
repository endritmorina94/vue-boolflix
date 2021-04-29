var app = new Vue(
    {
        el: '#root',
        data: {
            key: "99d1efa101b179fd70c80c694373d975",
            query: "rambo",
            movies: []
        },
        methods: {
            find() {

            }
        },
        mounted() {
            axios
                .get(`https://api.themoviedb.org/3/search/movie?api_key=${this.key}&query=${this.query}`)
                .then((response) => {
                    const result = response.data.results;
                    console.log(result);
                    this.movies = result;
                });
        }
    }
);
