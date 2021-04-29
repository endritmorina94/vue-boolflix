var app = new Vue(
    {
        el: '#root',
        data: {
            movies: []
        },
        methods: {
        },
        mounted() {
            axios
                .get('https://api.themoviedb.org/3/search/movie?api_key=99d1efa101b179fd70c80c694373d975&query=Rambo')
                .then((response) => {
                    const result = response.data.results;
                    console.log(result);
                    this.movies = result;
                });
        }
    }
);
