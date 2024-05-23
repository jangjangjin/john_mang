document.addEventListener('DOMContentLoaded', function () {
  const menuItems = document.querySelectorAll('nav.sidebar .menu-item');

  menuItems.forEach(menuItem => {
    menuItem.addEventListener('click', function (event) {
      const submenu = this.querySelector('.submenu');
      // 클릭된 요소가 submenu가 아닌 경우에만 토글을 수행합니다.
      if (submenu && event.target !== submenu && !submenu.contains(event.target)) {
        submenu.classList.toggle('visible');
      }
    });
  });
});
