const postsBlock = document.querySelector('.posts');
const testsBlock = document.querySelector('.tests');
const messagesBlock = document.querySelector('.messages');
const dbBlock = document.querySelector('.data-base');

const allBlocks = [postsBlock, testsBlock, messagesBlock, dbBlock];

const menuButtons = document.getElementsByClassName('menu-item');

for (let i = 0; i < menuButtons.length; i++) {
	menuButtons[i].addEventListener('click', () => {
		allBlocks.forEach(block => block.style.display = 'none')
		allBlocks[i].style.display = 'block';
	})
}

