function gradioApp(){
     var root = document.getElementsByTagName('gradio-app')[0]
     return root.shadowRoot? root.shadowRoot : root.ownerDocument;
}

function get_uiCurrentTab() {
    return gradioApp().querySelector('.tabs button:not(.border-transparent)')
}

function get_uiCurrentTabContent() {
    return gradioApp().querySelector('.tabitem[id^=tab_]:not([style*="display: none"])')
}

uiUpdateCallbacks = []
uiTabChangeCallbacks = []
let uiCurrentTab = null

function onUiUpdate(callback){
    uiUpdateCallbacks.push(callback)
}
function onUiTabChange(callback){
    uiTabChangeCallbacks.push(callback)
}

function runCallback(x, m){
    try {
        x(m)
    } catch (e) {
        (console.error || console.log).call(console, e.message, e);
    }
}
function executeCallbacks(queue, m) {
    queue.forEach(function(x){runCallback(x, m)})
}

document.addEventListener("DOMContentLoaded", function() {
    var mutationObserver = new MutationObserver(function(m){
        executeCallbacks(uiUpdateCallbacks, m);
        const newTab = get_uiCurrentTab();
        if ( newTab && ( newTab !== uiCurrentTab ) ) {
            uiCurrentTab = newTab;
            executeCallbacks(uiTabChangeCallbacks);
        }
    });
    mutationObserver.observe( gradioApp(), { childList:true, subtree:true })
});

/**
 * Add a ctrl+enter as a shortcut to start a generation
 */
 document.addEventListener('keydown', function(e) {
    var handled = false;
    if (e.key !== undefined) {
        if((e.key == "Enter" && (e.metaKey || e.ctrlKey || e.altKey))) handled = true;
    } else if (e.keyCode !== undefined) {
        if((e.keyCode == 13 && (e.metaKey || e.ctrlKey || e.altKey))) handled = true;
    }
    if (handled) {
        button = get_uiCurrentTabContent().querySelector('button[id$=_generate]');
        if (button) {
            button.click();
        }
        e.preventDefault();
    }
})

/**
 * checks that a UI element is not in another hidden element or tab content
 */
function uiElementIsVisible(el) {
    let isVisible = !el.closest('.\\!hidden');
    if ( ! isVisible ) {
        return false;
    }

    while( isVisible = el.closest('.tabitem')?.style.display !== 'none' ) {
        if ( ! isVisible ) {
            return false;
        } else if ( el.parentElement ) {
            el = el.parentElement
        } else {
            break;
        }
    }
    return isVisible;
}