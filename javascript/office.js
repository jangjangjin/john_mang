let socketMemorySpecs = [];
document.addEventListener('DOMContentLoaded', () => {
  // Firebase 초기화
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app(); // 이미 초기화된 앱 사용
  }

  const db = firebase.database();

  const budgetSlider = document.getElementById('budgetSlider');
  const labels = document.querySelectorAll('.label');
  const cpuBrandSelect = document.getElementById('cpuBrand');
  const recommendButton = document.getElementById('recommendButton');
  const recommendationResult = document.getElementById('recommendationResult');

  // 소켓과 메모리 규격을 저장할 배열
  const socketMemorySpecs = [];

  if (budgetSlider) {
    budgetSlider.value = "0"; // 기본값을 ~50만원으로 설정
    updateActiveLabel(budgetSlider.value); // 라벨 업데이트
  }
  if (budgetSlider) {
    budgetSlider.addEventListener('input', () => {
      updateActiveLabel(budgetSlider.value);
    });
  }

  if (labels) {
    labels.forEach(label => {
      label.addEventListener('click', () => {
        const value = label.getAttribute('data-value');
        budgetSlider.value = value;
        updateActiveLabel(value);
      });
    });
  }

  if (cpuBrandSelect) {
    cpuBrandSelect.addEventListener('change', () => {
      // 값이 변경될 때는 데이터를 가져오지 않습니다.
    });
  }

  if (recommendButton) {
    recommendButton.addEventListener('click', () => {
      if (!budgetSlider.value) {
        alert("금액 선택은 필수입니다.");
        return;
      }else
        fetchAndDisplayCpuData(budgetSlider.value, cpuBrandSelect.value);
        fetchAndDisplayCoolerData(budgetSlider.value);
    });
  }

  function updateActiveLabel(value) {
    labels.forEach(label => {
      if (label.getAttribute('data-value') == value) {
        label.classList.add('active');
      } else {
        label.classList.remove('active');
      }
    });
  }

  function fetchAndDisplayCpuData(value, brand) {
    const cpuRef = db.ref("부품/0/CPU");
    cpuRef.once("value", (snapshot) => {
        const cpus = snapshot.val();

        if (cpus) {
            const { cpuminPrice, cpumaxPrice } = getCpuPriceLimitsByValue(value);
            const filteredCpus = Object.values(cpus).filter(cpu => {
                const cpuPrice = parseInt(cpu["가격"].replace(/,/g, ""), 10);
                const isBrandMatch = brand === 'ANY' || cpu["제조사"] === brand;
                const isGraphicsMatch = ["0", "1", "2"].includes(value) && cpu["내장그래픽 여부"] === "O";            
                const isNoGraphicsMatch = !["0", "1", "2"].includes(value) && cpu["내장그래픽 여부"] === "X";
                return cpuPrice >= cpuminPrice && cpuPrice <= cpumaxPrice && isBrandMatch && (isGraphicsMatch || isNoGraphicsMatch);
            });
  
              if (filteredCpus.length > 0) {
                  const randomCpus = getRandomElements(filteredCpus, 4);
                  // 소켓과 메모리 규격을 저장
                  //socketMemorySpecs.length = 0; // 초기화
                  totalCosts = [0, 0, 0, 0]; // 각 견적 상자의 부품 가격 총 합을 저장하는 배열
                  randomCpus.forEach(cpu => {
                      socketMemorySpecs.push({ socket: cpu["소켓"], memory: cpu["메모리 규격"], innerGraphic: cpu["내장그래픽 여부"] });
                  });
                  displayData(randomCpus); // CPU 데이터만 표시
              } else {
                  recommendationResult.innerHTML = '<p>적합한 CPU를 찾을 수 없습니다.</p>';
              }
          } else {
              recommendationResult.innerHTML = '<p>CPU 데이터를 불러올 수 없습니다.</p>';
          }
      });
  }

  function getCpuPriceLimitsByValue(value) {
    const cpupriceLimits = {
      "0": { cpuminPrice: 100000, cpumaxPrice: 160000 }, // ~50 만원대
      "1": { cpuminPrice: 200000, cpumaxPrice: 300000 }, // 60~80 만원대
      "2": { cpuminPrice: 200000, cpumaxPrice: 300000 }, // 90~110 만원대
      "3": { cpuminPrice: 250000, cpumaxPrice: 300000 }, // 120~140 만원대
      "4": { cpuminPrice: 300000, cpumaxPrice: 600000 }, // 150~190 만원대
      "5": { cpuminPrice: 300000, cpumaxPrice: 600000 }, // 200~240 만원대
      "6": { cpuminPrice: 500000, cpumaxPrice: 1000000 } // 250~350 만원대
    };

    return cpupriceLimits[value] || { cpuminPrice: 0, cpumaxPrice: 0 };
  }


  function fetchAndDisplayCoolerData(value) {
    const coolerRef = db.ref("부품/0/Cooler");
    coolerRef.once("value", (snapshot) => {
      const coolersData = snapshot.val();
      if (coolersData) {
        const { minPrice, maxPrice } = getCoolerPriceLimitsByValue(value);
        const filteredCoolers = Object.values(coolersData).filter(cooler => {
          const coolerPrice = parseInt(cooler["가격"], 10);
          return coolerPrice >= minPrice && coolerPrice <= maxPrice;
        });

        if (filteredCoolers.length > 0) {
          const randomCoolers = getRandomElements(filteredCoolers, 4);
          displayCoolerData(randomCoolers); // 쿨러 데이터를 표시하는 다른 함수 호출
        } else {
          recommendationResult.innerHTML = '<p>적합한 쿨러를 찾을 수 없습니다.</p>';
        }
      } else {
        recommendationResult.innerHTML = '<p>쿨러 데이터를 불러올 수 없습니다.</p>';
      }
    });
  }
  function getCoolerPriceLimitsByValue(value1){
    const priceLimits ={
    "0": { minPrice:10000, maxPrice: 23000}, //~ 50만원대
    "1": { minPrice:20000, maxPrice: 40000},
    "2": { minPrice:29000, maxPrice: 60000},
    "3": { minPrice:29000, maxPrice: 80000},
    "4": { minPrice:29000, maxPrice: 80000},
    "5": { minPrice:29000, maxPrice: 100000},
    "6": { minPrice:38000, maxPrice: 1000000}
    };
    return priceLimits[value1] || {minPrice: 0, maxPrice: 0};
    }
    
    function getRandomElements(array, count) {
    const shuffled = array.slice();
    let i = array.length;
    const min = i - count;
    let temp, index;
    while (i-- > min) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
    }
    return shuffled.slice(min);
    }
    
    function displayData(cpus) {
    const cpuElements = [
    { name: "cpu1", price: "cpuPrice1" },
    { name: "cpu2", price: "cpuPrice2" },
    { name: "cpu3", price: "cpuPrice3" },
    { name: "cpu4", price: "cpuPrice4" }
    ];
    // CPU 데이터 표시
cpuElements.forEach((element, index) => {
  const cpu = cpus[index]; // cpus 배열에서 CPU를 가져옴
  const cpuElement = document.getElementById(element.name);
  const cpuPriceElement = document.getElementById(element.price);

  if (cpu) {
    if (cpuElement) {
      cpuElement.textContent = `${cpu["Name"]}`;
    }

    if (cpuPriceElement) {
      const cpuPrice = parseInt(cpu["가격"].replace(/,/g, ""), 10);
      cpuPriceElement.textContent = `${cpuPrice}원`;
      totalCosts[index] += cpuPrice;
    }
  } else {
    if (cpuElement) {
      cpuElement.textContent = "적합한 CPU를 찾을 수 없습니다.";
    }

    if (cpuPriceElement) {
      cpuPriceElement.textContent = "";
    }
  }
});

// 각 견적 상자의 부품 가격 총 합을 표시
totalCosts.forEach((totalCost, index) => {
  const totalElement = document.getElementById(`total${index + 1}`);
  const totalPriceElement = document.getElementById(`totalPrice${index + 1}`);
  if (totalElement && totalPriceElement) {
    totalElement.textContent = "총 합계금액";
    totalPriceElement.textContent = `${totalCost}원`;
  }
});

// 추후 필요할 때를 위해 소켓과 메모리 규격 저장
//console.log(socketMemorySpecs);
}
function displayCoolerData(coolersData) {
  const coolerElements = [
  { name: "cooler1", price: "coolerPrice1" },
  { name: "cooler2", price: "coolerPrice2" },
  { name: "cooler3", price: "coolerPrice3" },
  { name: "cooler4", price: "coolerPrice4" }
  ];
  // 쿨러 데이터 표시
coolerElements.forEach((element, index) => {
  const cooler = coolersData[index]; // 배열에서 쿨러 데이터 가져오기
  const coolerElement = document.getElementById(element.name);
  const coolerPriceElement = document.getElementById(element.price);

  if (cooler) {
    if (coolerElement) {
      coolerElement.textContent = `${cooler["이름"]}`;
    }
    if (coolerPriceElement) {
      const coolerPrice = parseInt(cooler["가격"], 10);
      coolerPriceElement.textContent = `${coolerPrice}원`;
      totalCosts[index] += coolerPrice;
    }
  } else {
    if (coolerElement) {
      coolerElement.textContent = "적합한 쿨러를 찾을 수 없습니다.";
    }

    if (coolerPriceElement) {
      coolerPriceElement.textContent = "";
    }
  }
});

// 각 견적 상자의 부품 가격 총 합을 표시
totalCosts.forEach((totalCost, index) => {
  const totalElement = document.getElementById(`total${index + 1}`);
  const totalPriceElement = document.getElementById(`totalPrice${index + 1}`);
  if (totalElement && totalPriceElement) {
    totalElement.textContent = "총 합계금액";
    totalPriceElement.textContent = `${totalCost}원`;
  }
});
}
});

