// Ensure external links open safely and add rel attributes
document.addEventListener('DOMContentLoaded', () => {
  const links = document.querySelectorAll('a[target="_blank"]');
  links.forEach(link => {
    link.setAttribute('rel', 'noopener noreferrer');
  });
  console.log('Portfolio loaded and security attributes applied');
});