const sourceLang = "tr";
const targetLang = "ru";
let url = "https://www.trendyol.com/altamira/unisex-bej-happiest-baskili-oversize-kapsonlu-sweatshirt-p-466787620?boutiqueId=618697&merchantId=725694&sav=true";

// Sayfa verilerini çekme işlemi
async function fetchData(url) {
  const response = await fetch(url);
  const body = await response.text();
  const parser = new DOMParser();
  const document = parser.parseFromString(body, 'text/html');
  return document;
}

(async () => {
  const document = await fetchData(url);

  // Verileri çekme işlemi
  const Head = document.querySelector('h1').textContent;
  const resimler = Array.from(document.querySelectorAll('.styles-module_slider__o0fqa img')).map(element => {
    let src = element.getAttribute('src').replace("/mnresize/128/192", '');
    return src;
  });
  const Description = removeEmptyLines(document.querySelector('#rich-content-wrapper').textContent);
  const price = document.querySelector('.product-price-container').textContent;

  // Verileri konsola yazdırma (örneğin)
  console.log("Başlık: " + Head);
  console.log("Fiyat: " + price);
  console.log("Açıklama: " + Description);
  console.log("Resimler: " + resimler.join(', '));
})();
