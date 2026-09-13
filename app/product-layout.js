const problem = document.querySelector('#problem');
const product = document.querySelector('#product');
const thesis = document.querySelector('.thesis');
const nav = document.querySelector('nav');
const primaryCta = document.querySelector('.hero-actions .primary');

if (problem && thesis) thesis.before(problem);
if (product && thesis) thesis.before(product);

if (nav && !nav.querySelector('a[href="#problem"]')) {
  const link = document.createElement('a');
  link.href = '#problem';
  link.textContent = 'Problem';
  nav.prepend(link);
}

if (nav && !nav.querySelector('a[href="#product"]')) {
  const link = document.createElement('a');
  link.href = '#product';
  link.textContent = 'Product';
  nav.insertBefore(link, nav.querySelector('a[href="#proof"]'));
}

if (primaryCta) {
  primaryCta.href = '#product';
  primaryCta.textContent = 'See how SeedLend works';
}
