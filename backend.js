// backend.js
export {} // Bu dosyayı bir modül olarak işaretler
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

const puppeteer = require('puppeteer');
const ExcelJS = require('exceljs');
const cheerio = require('cheerio');
const axios = require('axios');
const sourceLang = "tr";
const targetLang = "ru";
let url = "https://www.trendyol.com/altamira/unisex-bej-happiest-baskili-oversize-kapsonlu-sweatshirt-p-466787620?boutiqueId=618697&merchantId=725694&sav=true"
let translatedHead;
let translatedDescription;

// =============================================================================
(async () => {
  //Çekme işlemi
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(url);
  const htmlContent = await page.content();
  const $ = cheerio.load(htmlContent);

  //Veriler
  const Head = $('h1').text();
  const resimler = [];
  $('.styles-module_slider__o0fqa img').each((index, element) => {
    let src = $(element).attr('src');
    src = src.replace("/mnresize/128/192", '');

    resimler.push(src);
  });
  const Description = removeEmptyLines($('#rich-content-wrapper').text());
  const price = $('.product-price-container').text();

  //exele aktarma
  exportExel(Head, price, Description, resimler)
  console.log('Excel dosyası oluşturuldu ve güncellendi: veriler.xlsx');

  await browser.close();
})();
async function translateHeadText(text, sourceLanguage, targetLanguage) {
  const apiKey = "a2179494c27d6bd5b0c9"; // MyMemory API anahtarınız
  const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLanguage}|${targetLanguage}`;

  try {
    const response = await axios.get(apiUrl);
    const translatedText = response.data.responseData.translatedText;
    console.log("Çevrilen Metin:", translatedText);

    translatedHead = translatedText;
  } catch (error) {
    console.error("Hata:", error);
    throw error;
  }
}
async function translateDescriptionText(paragraph, sourceLanguage, targetLanguage) {
  const chunkSize = 500; // Parçalama boyutu
  const chunks = [];
  const apiKey = "a2179494c27d6bd5b0c9"; // MyMemory API anahtarınız

  for (let i = 0; i < paragraph.length; i += chunkSize) {
    chunks.push(paragraph.slice(i, i + chunkSize));
  }

  const translatedChunks = await Promise.all(chunks.map(chunk => {
    const apiUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${sourceLanguage}|${targetLanguage}&key=${apiKey}`;
    return axios.get(apiUrl)
      .then(response => response.data.responseData.translatedText)
      .catch(error => {
        console.error("Hata:", error); 6
        throw error;
      });
  }));

  const translatedText = translatedChunks.join('');
  translatedDescription = translatedChunks.join('');
  return translatedText;
}

function removeEmptyLines(text) {
  // Metni satırlara böler
  var lines = text.split('\n');
  // Boş satırları filtreler
  var nonEmptyLines = lines.filter(function (line) {
    return line.trim() !== ''; // Boş olmayan satırları korur
  });
  // Satırları tekrar birleştirir
  return nonEmptyLines.join('\n');
}
function exportExel(Head, Price, Description, resimler) {
  const lang = "ru"
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Sheet 1');

  const head = translateHeadText(Head, sourceLang, targetLang)
  const description = translateDescriptionText(Description, sourceLang, targetLang)

  setTimeout(function () {
    console.log(translatedHead);

    worksheet.getCell('A1').value = translatedHead;
    worksheet.getCell('B1').value = Price;
    worksheet.getCell('C1').value = translatedDescription;

    resimler.forEach((resim, index) => {
      worksheet.getCell(String.fromCharCode(70 + index) + '1').value = resim;
    });

    workbook.xlsx.writeFile('veriler.xlsx');
    console.log('Excel dosyası oluşturuldu ve güncellendi: veriler.xlsx');
  }, 5000);
}
