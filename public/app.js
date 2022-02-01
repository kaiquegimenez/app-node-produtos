function init() {
  alert('Bem vindos ao app Node')
  fetch('/api/produtos')
  .then(res => res.json())
    .then((produtos) => {
      let textHTML = ''
      produtos.forEach(produto => {
        textHTML += produto.descricao;
      });
      document.getElementById('lista_produtos').innerHTML = textHTML
    })
}
document.onload = init();