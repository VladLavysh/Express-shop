const toCurrency = price => {
  return new Intl.NumberFormat('ru-RU', {
    currency: 'usd',
    style: 'currency'
  }).format(price)
}

const toDate = date => {
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  }).format(new Date(date))
}

document.querySelectorAll('.price').forEach(node => {
  node.textContent = toCurrency(node.textContent)
})

document.querySelectorAll('.date').forEach(node => {
  node.textContent = toDate(node.textContent)
})

const $card = document.querySelector('#card')
if ($card) {
  $card.addEventListener('click', event => {
    if (event.target.classList.contains('js-remove')) {
      const { id, csrf } = event.target.dataset

      fetch('/card/remove/' + id, {
        method: 'delete',
        headers: {
          'X-XSRF-TOKEN': csrf
        }
      }).then(res => res.json())
        .then(card => {
          if (card.courses.length) {
            const html = card.courses.map(el => {
              return `
              <tr>
                <td>${el.title}</td>
                <td>${el.price}</td>
                <td>${el.count}</td>
                <td>
                  <button class="btn btm-small js-remove" data-id="${el.id}" data-csrf="${csrf}">Remove</button>
                </td>
              </tr>
            `
            }).join('')

            $card.querySelector('tbody').innerHTML = html
            $card.querySelector('.price').textContent = toCurrency(card.price)
          } else {
            $card.innerHTML = '<p>Card is empty</p>'
          }
        })
    }
  })
}

M.Tabs.init(document.querySelectorAll('.tabs'));
