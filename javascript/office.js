document.addEventListener('DOMContentLoaded', () => {
  // Firebase 초기화
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }

  const db = firebase.database();
  const budgetSlider = document.getElementById('budgetSlider');
  const labels = document.querySelectorAll('.label');
  const cpuBrandSelect = document.getElementById('cpuBrand');
  const recommendButton = document.getElementById('recommendButton');
  const recommendationResult = document.getElementById('recommendationResult');
  const preferredManufacturerSelect = document.getElementById('preferredManufacturer');
  const memorySizeSelect = document.getElementById('memorySize');
  const socketMemorySpecs = [];
  const memorySpecs = [];

  let totalCosts = [0, 0, 0, 0];

  budgetSlider.value = "0"; // 기본값 설정
  updateActiveLabel(budgetSlider.value);

  budgetSlider.addEventListener('input', () => updateActiveLabel(budgetSlider.value));

  labels.forEach(label => {
    label.addEventListener('click', () => {
      budgetSlider.value = label.getAttribute('data-value');
      updateActiveLabel(budgetSlider.value);
    });
  });

  recommendButton.addEventListener('click', () => {
    if (!budgetSlider.value) {
      alert("금액 선택은 필수입니다.");
      return;
    }
    fetchAndDisplayCpuData(budgetSlider.value, cpuBrandSelect.value);
    fetchAndDisplayCoolerData(budgetSlider.value);
    fetchAndDisplayMboardData(budgetSlider.value, preferredManufacturerSelect.value);
    fetchAndDisplayRAMData(budgetSlider.value, memorySizeSelect.value);
  });

  function updateActiveLabel(value) {
    labels.forEach(label => {
      label.classList.toggle('active', label.getAttribute('data-value') == value);
    });
  }

  function fetchAndDisplayCpuData(value, brand) {
    const cpuRef = db.ref("부품/0/CPU");
    cpuRef.once("value", snapshot => {
      const cpus = snapshot.val();
      if (cpus) {
        const { cpuminPrice, cpumaxPrice } = getCpuPriceLimitsByValue(value);
        const filteredCpus = Object.values(cpus).filter(cpu => {
          const cpuPrice = parseInt(cpu["가격"].replace(/,/g, ""), 10);
          const isBrandMatch = brand === 'ANY' || cpu["제조사"] === brand;
          const isGraphicsMatch = ["0", "1", "2"].includes(value) ? cpu["내장그래픽 여부"] === "O" : cpu["내장그래픽 여부"] === "X";
          return cpuPrice >= cpuminPrice && cpuPrice <= cpumaxPrice && isBrandMatch && isGraphicsMatch;
        });

        if (filteredCpus.length > 0) {
          const randomCpus = getRandomElements(filteredCpus, 4);
          totalCosts = [0, 0, 0, 0];
          randomCpus.forEach(cpu => socketMemorySpecs.push({ socket: cpu["소켓"], memory: cpu["메모리 규격"], innerGraphic: cpu["내장그래픽 여부"] }));
          displayData(randomCpus, "cpu");
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
    coolerRef.once("value", snapshot => {
      const coolers = snapshot.val();
      if (coolers) {
        const { minPrice, maxPrice } = getCoolerPriceLimitsByValue(value);
        const filteredCoolers = Object.values(coolers).filter(cooler => {
          const coolerPrice = parseInt(cooler["가격"], 10);
          return coolerPrice >= minPrice && coolerPrice <= maxPrice;
        });

        if (filteredCoolers.length > 0) {
          const randomCoolers = getRandomElements(filteredCoolers, 4);
          displayData(randomCoolers, "cooler");
        } else {
          recommendationResult.innerHTML = '<p>적합한 쿨러를 찾을 수 없습니다.</p>';
        }
      } else {
        recommendationResult.innerHTML = '<p>쿨러 데이터를 불러올 수 없습니다.</p>';
      }
    });
  }

  function getCoolerPriceLimitsByValue(value) {
    const priceLimits = {
      "0": { minPrice: 10000, maxPrice: 23000 }, // ~50만원대
      "1": { minPrice: 20000, maxPrice: 40000 },
      "2": { minPrice: 29000, maxPrice: 60000 },
      "3": { minPrice: 29000, maxPrice: 80000 },
      "4": { minPrice: 29000, maxPrice: 80000 },
      "5": { minPrice: 29000, maxPrice: 100000 },
      "6": { minPrice: 38000, maxPrice: 1000000 }
    };
    return priceLimits[value] || { minPrice: 0, maxPrice: 0 };
  }

  function fetchAndDisplayMboardData(value, preferredManufacturer) {
    const mboardRef = db.ref("부품/0/MBoard");
    mboardRef.once("value", snapshot => {
      const mboards = snapshot.val();
      if (mboards) {
        const { minPrice, maxPrice } = getMboardPriceLimitsByValue(value);
        const filteredMboards = Object.values(mboards).filter(mboard => {
          const mboardPrice = parseInt(mboard["가격"].replace(/,/g, ""), 10);
          const matchesSpecs = socketMemorySpecs.some(spec => spec.socket === mboard["소켓"] && spec.memory === mboard["메모리 규격"]);
          const isManufacturerMatch = preferredManufacturer === 'ANY' || mboard["제조사"] === preferredManufacturer;
          return mboardPrice >= minPrice && mboardPrice <= maxPrice && matchesSpecs && isManufacturerMatch;
        });

        if (filteredMboards.length > 0) {
          const randomMboards = getRandomElements(filteredMboards, 4);
          randomMboards.forEach(mboard => memorySpecs.push({memory: mboard["메모리 규격"]}));
          displayData(randomMboards, "mboard");
        } else {
          recommendationResult.innerHTML = '<p>적합한 메인보드를 찾을 수 없습니다.</p>';
        }
      } else {
        recommendationResult.innerHTML = '<p>메인보드 데이터를 불러올 수 없습니다.</p>';
      }
    });
  }

  function getMboardPriceLimitsByValue(value) {
    const priceLimits = {
      "0": { minPrice: 70000, maxPrice: 100000 }, // ~50만원대
      "1": { minPrice: 150000, maxPrice: 170000 },
      "2": { minPrice: 160000, maxPrice: 200000 },
      "3": { minPrice: 160000, maxPrice: 200000 },
      "4": { minPrice: 160000, maxPrice: 300000 },
      "5": { minPrice: 160000, maxPrice: 300000 },
      "6": { minPrice: 200000, maxPrice: 1000000 }
    };
    return priceLimits[value] || { minPrice: 0, maxPrice: 0 };
  }

  function fetchAndDisplayRAMData(value, memorySize) {
    const ramRef = db.ref("부품/0/RAM");
    ramRef.once("value", snapshot => {
      const rams = snapshot.val();
      if (rams) {
        const { minPrice, maxPrice } = getRAMPriceLimitsByValue(value);
        const filteredRams = Object.values(rams).filter(ram => {
          const ramPrice = parseInt(ram["가격"].replace(/,/g, ""), 10);
          const isMemorySizeMatch = memorySize === "ANY" || parseInt(ram["용량"]) === parseInt(memorySize);
          let isPriceMatch = false;

          if (value === "0" && ram["Name"].includes("(8GB)") && ramPrice >= minPrice && ramPrice <= maxPrice) {
            isPriceMatch = true;
          } else if (value === "1" && (ram["Name"].includes("(16GB)") || ram["Name"].includes("(16Gx2)")) && ramPrice >= minPrice && ramPrice <= maxPrice) {
            isPriceMatch = true;
          } else if (isMemorySizeMatch && ramPrice >= minPrice && ramPrice <= maxPrice) {
            isPriceMatch = true;
          }

          return isPriceMatch;
        });

        if (filteredRams.length > 0) {
          const matched8GBRams = filteredRams.filter(ram => ram["Name"].includes("(8GB)"));
          const matched16GBRams = filteredRams.filter(ram => ram["Name"].includes("(16GB)") || ram["Name"].includes("(16Gx2)"));
          const matched4GBRams = filteredRams.filter(ram => parseInt(ram["용량"]) === 4);

          matched8GBRams.forEach(ram => {
            ram["Name"] += "x2";
            ram["가격"] = parseInt(ram["가격"].replace(/,/g, ""), 10) * 2; // 8GB RAM의 경우 가격을 2배로 수정
          });

          matched16GBRams.forEach(ram => {
            if (!ram["Name"].includes("x2")) {
              ram["Name"] += "x2";
            }
            ram["가격"] = parseInt(ram["가격"].replace(/,/g, ""), 10) * 2; // 16GB RAM의 경우 가격을 2배로 수정
          });

          matched4GBRams.forEach(ram => {
            ram["Name"] += "x4";
            ram["가격"] = parseInt(ram["가격"].replace(/,/g, ""), 10) * 4; // 4GB RAM의 경우 가격을 4배로 수정
          });

          const randomRams = getRandomElements([...matched8GBRams, ...matched16GBRams, ...matched4GBRams], 4);
          displayData(randomRams, "ram");
        } else {
          recommendationResult.innerHTML = '<p>적합한 메모리를 찾을 수 없습니다.</p>';
        }
      } else {
        recommendationResult.innerHTML = '<p>메모리 데이터를 불러올 수 없습니다.</p>';
      }
    });
  }

  function getRAMPriceLimitsByValue(value) {
    const priceLimits = {
      "0": { minPrice: 15000, maxPrice: 30000 },
      "1": { minPrice: 30000, maxPrice: 70000 },
      "2": { minPrice: 30000, maxPrice: 70000 },
      "3": { minPrice: 60000, maxPrice: 100000 },
      "4": { minPrice: 60000, maxPrice: 150000 },
      "5": { minPrice: 100000, maxPrice: 200000 },
      "6": { minPrice: 100000, maxPrice: 300000 }
    };
    return priceLimits[value] || { minPrice: 0, maxPrice: 0 };
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
  function displayData(items, type) {
    const elements = [
        { name: `${type}1`, price: `${type}Price1` },
        { name: `${type}2`, price: `${type}Price2` },
        { name: `${type}3`, price: `${type}Price3` },
        { name: `${type}4`, price: `${type}Price4` }
    ];

    elements.forEach((element, index) => {
        const item = items[index];
        const itemElement = document.getElementById(element.name);
        const itemPriceElement = document.getElementById(element.price);

        if (itemElement && itemPriceElement) {
            if (item) {
                if (type === 'ram' && index === 0 && items.length === 1) {
                
                    itemElement.textContent = `${item["Name"]} x2`;
                    const itemPrice = parseInt(String(item["가격"]).replace(/,/g, ""), 10) * 2;
                    itemPriceElement.textContent = `${itemPrice}원`;
                    totalCosts[index] += itemPrice;
                } else {
                    itemElement.textContent = item["이름"] || item["Name"];
                    const itemPrice = parseInt(String(item["가격"]).replace(/,/g, ""), 10);
                    itemPriceElement.textContent = `${itemPrice}원`;
                    totalCosts[index] += itemPrice;
                }
            } else {
                itemElement.textContent = `적합한 ${type === 'cpu' ? 'CPU' : (type === 'cooler' ? '쿨러' : (type === 'ram' ? '램' : '메인보드'))}를 찾을 수 없습니다.`;
                itemPriceElement.textContent = "";
            }
        } else {
            console.error(`Element with ID ${element.name} or ${element.price} not found.`);
        }
    });

    totalCosts.forEach((totalCost, index) => {
        const totalElement = document.getElementById(`total${index + 1}`);
        const totalPriceElement = document.getElementById(`totalPrice${index + 1}`);
        if (totalElement && totalPriceElement) {
            totalElement.textContent = "총 합계금액";
            totalPriceElement.textContent = `${totalCost}원`;
        } else {
            console.error(`Element with ID total${index + 1} or totalPrice${index + 1} not found.`);
        }
        
    });
  }
});
