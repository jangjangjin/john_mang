document.addEventListener('DOMContentLoaded', () => {
    const slider = document.getElementById('budgetSlider'); // ID updated
    const labels = document.querySelectorAll('.label');
    

    labels.forEach(label => {
      label.addEventListener('click', () => {
        const value = label.getAttribute('data-value');
        slider.value = value;
        updateActiveLabel(value);
      });
    });
   
    slider.addEventListener('input', () => {
      updateActiveLabel(slider.value);
    });

    function updateActiveLabel(value) {
      labels.forEach(label => {
        if (label.getAttribute('data-value') == value) {
          label.classList.add('active');
        } else {
          label.classList.remove('active');
        }
      });
    }

  });