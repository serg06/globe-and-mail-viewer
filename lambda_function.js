const https = require('https');
const htmlparser = require('htmlparser2');

function isstring(s) {
    return typeof s === 'string' || s instanceof String;
}

function setup_parser() {
    let paragraph_results = [];

    const parser = new htmlparser.Parser(
        {
            onopentag(name, attribs) {
                // if we're entering a paragraph
                if (name === 'p') {
                    // if it's an article's paragraph
                    if (isstring(attribs.class) && attribs.class.indexOf('c-article-body__text') !== -1) {
                        // remember that we're in a good paragraph
                        if (this._attrs.in_paragraph === true) {
                            console.error('Found nested body__text paragraphs??');
                        }

                        this._attrs.in_paragraph = true;
                    }

                    // keep track of how many paragraphs deep we are INSIDE of current body__text paragraph
                    // base depth = 1
                    if (this._attrs.in_paragraph) {
                        this._attrs.paragraph_depth += 1;
                    }
                }
            },
            ontext(text) {
                // if we're inside a body__text paragraph, record text
                if (this._attrs.in_paragraph) {
                    this._attrs.current_paragraph += text;
                }
            },
            onclosetag(tagname) {
                // if we're in a body__text paragraph
                if (this._attrs.in_paragraph) {
                    // once we leave a paragraph, keep track of depth
                    this._attrs.paragraph_depth -= 1;

                    // if we've left all paragraphs, we are no longer in an article's paragraph
                    if (this._attrs.paragraph_depth === 0) {
                        this._attrs.in_paragraph = false;
                        this._attrs.paragraphs.push(this._attrs.current_paragraph);
                        this._attrs.current_paragraph = '';
                    }
                }
            },
            // attributes to work with
            _attrs: {
                in_paragraph: false,
                current_paragraph: '',
                paragraphs: paragraph_results,
                paragraph_depth: 0
            }
        },
        {
            decodeEntities: false,
            lowerCaseTags: true,
            lowerCaseAttributeNames: true,
            xmlMode: true,
            recognizeSelfClosing: true
        });

    // return the parser, and a pointer to its results array
    return [parser, paragraph_results];
}

exports.handler = async (event, context) => {
    // default result -- just need to change body and maybe status code
    let result = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
        },
        body: "Server error: Server forgot to update body somehow."
    };

    let get_params = event.queryStringParameters;
    console.log(`GET params: ${JSON.stringify(get_params)}`);

    // TODO: make sure it's GET (just disable anything but GET in AWS)

    let globeurl = get_params.globeurl;
    console.log("globe url: " + globeurl);

    if (!globeurl) {
        console.log(`invalid globeurl: '${globeurl}'`);
        result.body = JSON.stringify({"error": `invalid globeurl: '${globeurl}'`});
        return result;
    }

    // TODO: validate globeurl with regex
    // TODO: CORS only allow my github url

    const [parser, paragraphs] = setup_parser();

    const promise = new Promise(function (resolve, reject) {
        https.get(globeurl, (res) => {
            console.log("result status code:", res.statusCode);

            res.on('data', (d) => {
                parser.write(d);
            });

            res.on('end', () => {
                parser.end();
                result.body = JSON.stringify({'article': paragraphs});
                resolve(result);
            })
        }).on('error', (e) => {
            console.log("convert globe err to json");
            result.body = JSON.stringify({'error': `Globe and Mail error: "${JSON.stringify(e)}"`});
            console.log("done");
            reject(result);
        })
    });

    return promise;
};