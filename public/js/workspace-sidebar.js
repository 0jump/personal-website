/* Ths file should encompass all sidebar functionality for users who are LOGGED IN. Including the opening and closing of the sidebar upon the clicking of the burger icon*/

const sidebarCtr = _("sidebar-ctr");
const header = _("header");
const mainCtr = _("container");
const wrapper = _("wrapper");
const inner = _("inner");


// Functionality 1: Opening the sidebar on burger icon click
let navMenuBtn = _('nav-menu-icon');
let isSideBarShown = false;

let resizeWrapperToStayResponsiveWhenSidebarIsOpen = () => {
    
    if(window.innerWidth <= 450){
        // if the width of the window is too small,do nothing because decreasing the width of the content is so small that the burger icon will no longer be visible and therefore the sidebar cannot be closed
    }else{
        wrapper.style.width = `${window.innerWidth - 256}px`;
    }
}

let showSidebar = () => {
    // This is so the opening of the sidebar is a smooth motion with a "transition" property in css. 
    wrapper.classList.toggle("wrapper-moving");
    //But I then want to remove this transition property after the menu has opened (which takes 0.5 seconds as I have put in the css file)
    setTimeout(function() {
        wrapper.classList.toggle("wrapper-moving");
    }, 500);
    sidebarCtr.classList.toggle("open-sidebar");
    inner.classList.toggle("inner-moved-right");

    // Add an event listener to keep the content that is now sharing the window with the sidebar responsive
    window.addEventListener("resize", resizeWrapperToStayResponsiveWhenSidebarIsOpen);
    // Initially resize the content to still be responsive
    resizeWrapperToStayResponsiveWhenSidebarIsOpen();
    isSideBarShown = true;
}

let hideSideBar = () => {
    wrapper.classList.toggle("wrapper-moving");
    setTimeout(function() {
        wrapper.classList.toggle("wrapper-moving");
    }, 500);
    sidebarCtr.classList.toggle("open-sidebar");
    inner.classList.toggle("inner-moved-right");
    window.removeEventListener("resize", resizeWrapperToStayResponsiveWhenSidebarIsOpen);
    wrapper.style.width = "100%";
    isSideBarShown = false;
}
navMenuBtn.onclick = () => {
    // Show Sidebar Menu
    if (isSideBarShown){
        hideSideBar();
    }else{
        showSidebar();
    }
}


