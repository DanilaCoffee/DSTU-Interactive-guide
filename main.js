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
const header = document.querySelector('header')
let scrollY = 0

advicesText.addEventListener('mouseenter', function() {
    advices.classList.remove('active')
})

advicesText.addEventListener('mouseleave', function() {
    advices.classList.add('active')
})

// header.addEventListener('mouseenter', function() {
//     header.classList.remove('headerShort')
// })

// header.addEventListener('mouseleave', function() {
//     if (scrollY > 100) {
//         let timer = setTimeout(() => {
//             header.classList.add('headerShort')
//         }, 500)
//         header.addEventListener('mouseenter', function() {
//             clearTimeout(timer)
//         })
//     }
// })

// window.addEventListener('scroll', () => {
    
//     scrollY = window.scrollY || window.pageYOffset
    
//     if (scrollY > 100) {
//         header.classList.add('headerShort')
//     } else {
//         header.classList.remove('headerShort')
//     }
// })

// updateHeaderPosition = () => {
//     const b1 = document.querySelector('.b1')
//     const header = document.querySelector('header')
    
//     const b1Rect = b1.getBoundingClientRect()
//     header.style.left = (b1Rect.left + 40) + 'px'
// }

// window.addEventListener('load', updateHeaderPosition)
// window.addEventListener('resize', updateHeaderPosition)
// window.addEventListener('scroll', updateHeaderPosition)