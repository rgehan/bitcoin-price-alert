setInterval(() => {
  let target = document.getElementById('price-container');

  fetch('/price')
  .then(res => res.json())
  .then(price => {
    target.innerHTML = '$' + price;
  })
  .catch(err => {
    console.error(err);
  });
}, 1000);
