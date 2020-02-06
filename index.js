let exampleurl = 'https://www.theglobeandmail.com/business/economy/article-ontario-posts-record-year-for-job-creation-but-toronto-dominates/';
let awsurl = 'https://urlfacio2h.execute-api.us-east-2.amazonaws.com/default/getglobe';
let article_css_selector = '#article';
let input_url_css_selector = '#input_url';
let btn_fetch_article_css_selector = '#btn_fetch_article';

function set_article_text(text) {
    let article = document.querySelector(article_css_selector);
    article.innerText = text;
}

function set_article_html(html) {
    let article = document.querySelector(article_css_selector);
    article.innerHTML = html;
}

function fill_article(url) {
    let aws = new URL(awsurl);
    let params = {
        globeurl: url
    };

    Object.keys(params).forEach(key => aws.searchParams.append(key, params[key]));

    fetch(aws)
		// convert to json
        .then(function (data) {
            return data.json();
        })
		// post article if returned successfully, else error out
        .then(function (json) {
            if (json.article) {
                let article = '';
                for (const line of json.article) {
                    article += `<p>${line}</p>`;
                }
                set_article_html(article);
            } else if (json.error) {
                throw json.error;
            } else {
                throw "no article or error received from server!";
            }
        })
		// nicely display errors
        .catch(function (error) {
            set_article_text("error: " + error);
        });
}

// connect the get-url button
window.onload = () => {
    let btn = document.querySelector(btn_fetch_article_css_selector);

    btn.onclick = () => {
        let url_field = document.querySelector(input_url_css_selector);
        let url = url_field.value;
        set_article_text(`Getting article for URL ${url}...`);
        fill_article(url);
    }
};
