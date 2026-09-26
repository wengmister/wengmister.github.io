# WENGMISTER.GITHUB.IO

[![Github Workflow Status](https://img.shields.io/github/actions/workflow/status/wengmister/wengmister.github.io/jekyll.yml?branch=main&event=push&style=flat)](https://github.com/wengmister/wengmister.github.io/actions/workflows/jekyll.yml)
![Repository Size](https://img.shields.io/github/repo-size/wengmister/wengmister.github.io)

Welcome to my website! Please visit the main site [here](wengmister.github.io).

## Local preview and browser tests

With the Ruby version in `.ruby-version` and Bundler installed:

```sh
bundle install
bundle exec jekyll build
cp _tests/project-modal.html _site/project-modal-tests.html
bundle exec jekyll serve --skip-initial-build
```

Open `http://127.0.0.1:4000/` for the preview and
`http://127.0.0.1:4000/project-modal-tests.html` for the browser regression results.
The tests exercise the built site in an iframe, including project history, focus,
loading failures, and mobile layout. `_tests` is excluded from the published site
by Jekyll's underscore-directory convention.
