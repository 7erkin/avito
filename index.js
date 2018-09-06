const http = require('https');
const fs = require('fs');

const domain = 'https://m.avito.ru';
const url = `${domain}/belgorod/kvartiry`;
const LIMIT = 20;
const data = [];
let phonesUrls;
let quantityHandledAdds = 0;

const findUrls = (content) => {
    const urls = content.match(/href="\/belgorod\/kvartiry[^"]+/g).map((element) => {
        return element.slice(6, element.length);
    });
    return urls;
};
const cutPhone = (content) => {
    return content.match(/tel:\+[0-9]+/)[0];
};
const cutDescription = (content) => {
    let temp = content.match(/<title.+<\/title>/)[0];
    temp = temp.match(/>.+</)[0]
    return temp.slice(1, temp.length - 1);
};
const toString = (data) => {
    let str = '';
    data.forEach(element => {
        str += (element.phone + '    Description: ' + element.description) + '\r\n'; 
    });
    return str;
};
const getData = () => {
    http.get(`${domain}${phonesUrls[quantityHandledAdds]}`, (res) => {
        let content = '';
        res.on('data', (chunk) => {
            content += chunk;
        });
        res.on('end', () => {
            const phone = cutPhone(content);
            const description = cutDescription(content);
            data.push({
                phone, description
            });
            if(quantityHandledAdds !== LIMIT) {
                ++quantityHandledAdds;
                getData();
            } else {
                const str = toString(data);
                fs.writeFile(__dirname + '\\data.txt', str);
            }
        });
    }).on('error', () => {});
};

http.get(url, (res) => {
    let content = ``;
    res.on('data', (chunk) => {
        content += chunk;
    });
    res.on('end', () => {
        phonesUrls = findUrls(content);
        getData();
    });
}).on('error', () => {console.log('error')});
