const userNameBlock = document.querySelector('.userName')

let userNameShow = () => {
	document.querySelector('.userImg').style.transform = `translateX(0px)`
    userNameBlock.style.transform = `translateX(0px)`
}

let userNameHide = () => {
	const textWidth = userNameBlock.scrollWidth + 31;
    document.querySelector('.userImg').style.transform = `translateX(${textWidth}px)`
    userNameBlock.style.transform = `translateX(${textWidth}px)`
}

document.querySelector('.profileBlock').addEventListener('mouseenter', () => {
    userNameShow()
})

document.querySelector('.profileBlock').addEventListener('mouseleave', () => {
	userNameHide()
})

window.addEventListener('load', () => {
    userNameHide()
    setTimeout(() => {
    	document.querySelector('.userImg').style.transition = 'transform 0.2s ease-in-out'
    	document.querySelector('.userName').style.transition = 'transform 0.2s ease-in-out'
    	document.querySelector('header').style.opacity = '1'
    	document.querySelector('.welcomeBlock').style.opacity = '1'
    }, 10)
})

const advices = document.querySelector('.advices')
const advicesText = document.querySelector('.advicesText')

advicesText.addEventListener('mouseenter', function() {
    advices.classList.remove('active')
})

advicesText.addEventListener('mouseleave', function() {
    advices.classList.add('active')
})