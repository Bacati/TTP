	document.addEventListener('DOMContentLoaded', () => {
	  const categoryLinks = document.querySelectorAll('.categorie');
  
	  categoryLinks.forEach(link => {
		link.addEventListener('click', (event) => {
		  event.preventDefault();
  
		  categoryLinks.forEach(link => {
			link.classList.remove('bg-white', 'border-2', 'border-orange-300');
			link.classList.add('categorie');
		  });
  
		  link.classList.add('bg-white', 'border-2', 'border-orange-300');
		  link.classList.remove('categorie');

		  const targetId = link.getAttribute('href').substring(1);
		  const target = document.getElementById(targetId);
  
		  if (target) {
			window.scrollTo({
			  top: target.offsetTop,
			  behavior: 'smooth'
			});
		  }
		});
	  });
	});