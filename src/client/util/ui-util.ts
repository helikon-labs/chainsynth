function show(element: HTMLElement) {
    element.classList.remove('no-display');
}

function hide(element: HTMLElement) {
    element.classList.add('no-display');
}

export { show, hide };
