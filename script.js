// outils pour voir si référencé
// analytics

let pj = document.getElementsByClassName('container')
console.log(pj)

// Array.from(pj).forEach(function(element){
//   element.addEventListener('mouseover', function(e){
//     console.log('oui')
//   })
// })
pj.addEventListener('mousemove', function(e){
    console.log('oui')
  });
// Array.from(pj).forEach(function(element) {
//   element.addEventListener('mousemove', function(e){
//     console.log('oui')
//   });
// });
