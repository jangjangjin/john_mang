// 로딩창
// 로딩 창 표시 함수
function showLoading() {
  document.getElementById("loading").style.display = "flex";
}
// 로딩 창 숨기기 함수
function hideLoading() {
  document.getElementById("loading").style.display = "none";
}
document.addEventListener("DOMContentLoaded", () => {
  // Firebase 초기화
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  } else {
    firebase.app();
  }
  const db = firebase.database();
  const budgetSlider = document.getElementById("budgetSlider");
  const labels = document.querySelectorAll(".label");
  const cpuBrandSelect = document.getElementById("cpuBrand");
  const recommendButton = document.getElementById("recommendButton");
  const recommendationResult = document.getElementById("recommendationResult");
  const preferredManufacturerSelect = document.getElementById(
    "preferredManufacturer"
  );
  const memorySizeSelect = document.getElementById("memorySize");
  const diskSizeSelect = document.getElementById("diskSize");
  const hddSizeSelect = document.getElementById("hddSize");
  const socketMemorySpecs = [];
  const memorySpecs = [];
  const powerSpecs = [];

  let totalCosts = [0, 0, 0, 0];

  budgetSlider.value = "0"; // 기본값 설정
  updateActiveLabel(budgetSlider.value);

  budgetSlider.addEventListener("input", () =>
    updateActiveLabel(budgetSlider.value)
  );

  labels.forEach((label) => {
    label.addEventListener("click", () => {
      budgetSlider.value = label.getAttribute("data-value");
      updateActiveLabel(budgetSlider.value);
    });
  });
  recommendButton.addEventListener("click", () => {
    socketMemorySpecs.length=0;
    memorySpecs.length=0;
    powerSpecs.length=0;

    showLoading();
    if (!budgetSlider.value) {
      hideLoading();
      alert("금액 선택은 필수입니다.");
  
      return;
    }
  
    // recommendation-section을 보이게 하는 코드
    const recommendationSection = document.querySelector(".recommendation-section");
  
    setTimeout(() => {
      recommendationSection.style.display = "grid"; // 또는 'flex', 레이아웃에 따라 다를 수 있음
  
      fetchAndDisplayCpuData(budgetSlider.value, cpuBrandSelect.value);
      fetchAndDisplayPowerData(budgetSlider.value); // 이 부분을 추가
      fetchAndDisplayCoolerData(budgetSlider.value);
      fetchAndDisplayMboardData(
        budgetSlider.value,
        preferredManufacturerSelect.value
      );
      fetchAndDisplayRAMData(budgetSlider.value, memorySizeSelect.value);
      if (budgetSlider.value >= 2) {
        fetchAndDisplayVgaData(
          budgetSlider.value,
          preferredManufacturerSelect.value
        );
      }
      fetchAndDisplaySSDData(budgetSlider.value, diskSizeSelect.value);
      fetchAndDisplayHDDData(budgetSlider.value, hddSizeSelect.value);
      fetchAndDisplayCaseData(budgetSlider.value);
      hideLoading(); // 로딩창 숨기기
    }, 2000); // 2000초 딜레이
  });
  

  function updateActiveLabel(value) {
    labels.forEach((label) => {
      label.classList.toggle(
        "active",
        label.getAttribute("data-value") == value
      );
    });
  }

  function fetchAndDisplayCpuData(value, brand) {
    const cpuRef = db.ref("부품/0/CPU");
    cpuRef.once("value", (snapshot) => {
      const cpus = snapshot.val();
      if (cpus) {
        const { cpuminPrice, cpumaxPrice } = getCpuPriceLimitsByValue(value);
        const filteredCpus = Object.values(cpus).filter((cpu) => {
          const cpuPrice = parseInt(cpu["가격"].replace(/,/g, ""), 10);
          const isBrandMatch = brand === "ANY" || cpu["제조사"] === brand;
          const isGraphicsMatch =
            value === "0" || value === "1"
              ? cpu["내장그래픽 여부"] === "O"
              : cpu["내장그래픽 여부"] === "X";
          return (
            cpuPrice >= cpuminPrice &&
            cpuPrice <= cpumaxPrice &&
            isBrandMatch &&
            isGraphicsMatch
          );
        });

        if (filteredCpus.length > 0) {
          const randomCpus = getRandomElements(filteredCpus, 4);
          totalCosts = [0, 0, 0, 0];
          randomCpus.forEach((cpu) => {
            socketMemorySpecs.push({
              socket: cpu["소켓"],
              memory: cpu["메모리 규격"],
              innerGraphic: cpu["내장그래픽 여부"],
            });       
          });
          displayData(randomCpus, "cpu");
        } else {
          recommendationResult.innerHTML =
            "<p>적합한 CPU를 찾을 수 없습니다.</p>";
        }
      } else {
        recommendationResult.innerHTML =
          "<p>CPU 데이터를 불러올 수 없습니다.</p>";
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
      "6": { cpuminPrice: 500000, cpumaxPrice: 1000000 }, // 250~350 만원대
    };
    return cpupriceLimits[value] || { cpuminPrice: 0, cpumaxPrice: 0 };
  }

  function fetchAndDisplayCoolerData(value) {
    const coolerRef = db.ref("부품/0/Cooler");
    coolerRef.once("value", (snapshot) => {
      const coolers = snapshot.val();
      if (coolers) {
        const { minPrice, maxPrice } = getCoolerPriceLimitsByValue(value);
        const filteredCoolers = Object.values(coolers).filter((cooler) => {
          const coolerPrice = parseInt(cooler["가격"], 10);
          return coolerPrice >= minPrice && coolerPrice <= maxPrice;
        });

        if (filteredCoolers.length > 0) {
          const randomCoolers = getRandomElements(filteredCoolers, 4);
          displayData(randomCoolers, "cooler");
        } else {
          recommendationResult.innerHTML =
            "<p>적합한 쿨러를 찾을 수 없습니다.</p>";
        }
      } else {
        recommendationResult.innerHTML =
          "<p>쿨러 데이터를 불러올 수 없습니다.</p>";
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
      "6": { minPrice: 38000, maxPrice: 1000000 },
    };
    return priceLimits[value] || { minPrice: 0, maxPrice: 0 };
  }

  function fetchAndDisplayMboardData(value, preferredManufacturer) {
    const mboardRef = db.ref("부품/0/MBoard");
    mboardRef.once("value", (snapshot) => {
        const mboards = snapshot.val();
        if (mboards) {
            const { minPrice, maxPrice } = getMboardPriceLimitsByValue(value);
            const filteredMboards = Object.values(mboards).filter((mboard) => {
                const mboardPrice = parseInt(mboard["가격"].replace(/,/g, ""), 10);
                const matchesSpecs = socketMemorySpecs.some(
                    (spec) =>
                        spec.socket === mboard["소켓"] &&
                        spec.memory === mboard["메모리 규격"]
                );
                const isManufacturerMatch =
                    preferredManufacturer === "ANY" ||
                    mboard["제조사"] === preferredManufacturer;
                // "메모리 규격" 속성이 존재하고 유효한 경우에만 필터링
                const hasMemorySpec = mboard.hasOwnProperty("메모리 규격") && mboard["메모리 규격"];
                return (
                    mboardPrice >= minPrice &&
                    mboardPrice <= maxPrice &&
                    matchesSpecs &&
                    isManufacturerMatch &&
                    hasMemorySpec
                );
            });

            if (filteredMboards.length > 0) {
                const randomMboards = getRandomElements(filteredMboards, 4);
                randomMboards.forEach((mboard) =>
                    memorySpecs.push({ memory: mboard["메모리 규격"] })
                );
                displayData(randomMboards, "mboard");
            } else {
                recommendationResult.innerHTML =
                    "<p>적합한 메인보드를 찾을 수 없습니다.</p>";
            }
        } else {
            recommendationResult.innerHTML =
                "<p>메인보드 데이터를 불러올 수 없습니다.</p>";
        }
    });
}

  function getMboardPriceLimitsByValue(value) {
    const priceLimits = {
      "0": { minPrice: 0, maxPrice: 100000 }, // ~50만원대
      "1": { minPrice: 150000, maxPrice: 170000 },
      "2": { minPrice: 160000, maxPrice: 200000 },
      "3": { minPrice: 160000, maxPrice: 200000 },
      "4": { minPrice: 160000, maxPrice: 300000 },
      "5": { minPrice: 160000, maxPrice: 300000 },
      "6": { minPrice: 200000, maxPrice: 1000000 },
    };
    return priceLimits[value] || { minPrice: 0, maxPrice: 0 };
  }

  function fetchAndDisplayRAMData(value, memorySize) {
    const ramRef = db.ref("부품/0/RAM");
    ramRef.once("value", (snapshot) => {
      const rams = snapshot.val();
      if (rams) {
        const { minPrice, maxPrice } = getRAMPriceLimitsByValue(value);
        const filteredRams = Object.values(rams).filter((ram) => {
          const ramPrice = parseInt(ram["가격"].replace(/,/g, ""), 10);
          const isMemorySizeMatch =
            memorySize === "ANY" ||
            parseInt(ram["용량"]) === parseInt(memorySize);
          let isPriceMatch = false;

          if (
            value === "0" &&
            ram["Name"].includes("(8GB)") &&
            ramPrice >= minPrice &&
            ramPrice <= maxPrice
          ) {
            isPriceMatch = true;
          } else if (
            value === "1" &&
            (ram["Name"].includes("(16GB)") ||
              ram["Name"].includes("(16Gx2)")) &&
            ramPrice >= minPrice &&
            ramPrice <= maxPrice
          ) {
            isPriceMatch = true;
          } else if (
            isMemorySizeMatch &&
            ramPrice >= minPrice &&
            ramPrice <= maxPrice
          ) {
            isPriceMatch = true;
          }

          return isPriceMatch;
        });

        if (filteredRams.length > 0) {
          const matched8GBRams = filteredRams.filter((ram) =>
            ram["Name"].includes("(8GB)")
          );
          const matched16GBRams = filteredRams.filter(
            (ram) =>
              ram["Name"].includes("(16GB)") || ram["Name"].includes("(16Gx2)")
          );
          const matched4GBRams = filteredRams.filter(
            (ram) => parseInt(ram["용량"]) === 4
          );

          matched8GBRams.forEach((ram) => {
            ram["Name"] += "x2";
            ram["가격"] = parseInt(ram["가격"].replace(/,/g, ""), 10) * 2; // 8GB RAM의 경우 가격을 2배로 수정
          });

          matched16GBRams.forEach((ram) => {
            if (!ram["Name"].includes("x2")) {
              ram["Name"] += "x2";
            }
            ram["가격"] = parseInt(ram["가격"].replace(/,/g, ""), 10) * 2; // 16GB RAM의 경우 가격을 2배로 수정
          });

          matched4GBRams.forEach((ram) => {
            ram["Name"] += "x4";
            ram["가격"] = parseInt(ram["가격"].replace(/,/g, ""), 10) * 4; // 4GB RAM의 경우 가격을 4배로 수정
          });

          const randomRams = getRandomElements(
            [...matched8GBRams, ...matched16GBRams, ...matched4GBRams],
            4
          );
          displayData(randomRams, "ram");
        } else {
          recommendationResult.innerHTML =
            "<p>적합한 메모리를 찾을 수 없습니다.</p>";
        }
      } else {
        recommendationResult.innerHTML =
          "<p>메모리 데이터를 불러올 수 없습니다.</p>";
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
      "6": { minPrice: 100000, maxPrice: 300000 },
    };
    return priceLimits[value] || { minPrice: 0, maxPrice: 0 };
  }
  function fetchAndDisplayVgaData(value, preferredManufacturer) {
    const vgaRef = db.ref("부품/0/VGA");
    vgaRef.once("value", (snapshot) => {
        const vgas = snapshot.val();
        if (vgas) {
            const { minPrice, maxPrice } = getVgaPriceLimitsByValue(value);
            const filteredVgas = Object.values(vgas).filter((vga) => {
                const vgaPrice = parseInt(vga["가격"].replace(/,/g, ""), 10);
                const isManufacturerMatch =
                    preferredManufacturer === "ANY" ||
                    vga["제조사"] === preferredManufacturer;
                // 넘버링이 4000 이상인 그래픽 카드만 필터링
                const isNumberingValid = parseInt(vga["넘버링"], 10) >= 4000;
                return (
                    vgaPrice >= minPrice && 
                    vgaPrice <= maxPrice && 
                    isManufacturerMatch &&
                    isNumberingValid
                );
            });
            if (filteredVgas.length > 0) {
                const randomVgas = getRandomElements(filteredVgas, 4);
              
                randomVgas.forEach((vga) => {
                    powerSpecs.push({ power: vga["정격파워"] });
                });
                displayData(randomVgas, "vga");
            } else {
                recommendationResult.innerHTML =
                    "<p>적합한 그래픽 카드를 찾을 수 없습니다.</p>";
            }
        } else {
            recommendationResult.innerHTML =
                "<p>그래픽 카드 데이터를 불러올 수 없습니다.</p>";
        }
    });
}



  function getVgaPriceLimitsByValue(value) {
    const priceLimits = {
      "0": { minPrice: 0, maxPrice: 0 }, // 내장 그래픽 포함 경우, 50만원 이하 예산에서는 GPU 없음
      "1": { minPrice: 0, maxPrice: 0 }, // 내장 그래픽 포함 경우, 50만원 이하 예산에서는 GPU 없음
      "2": { minPrice: 100000, maxPrice: 500000 },
      "3": { minPrice: 300000, maxPrice: 500000 },
      "4": { minPrice: 500000, maxPrice: 700000 },
      "5": { minPrice: 700000, maxPrice: 1000000 },
      "6": { minPrice: 1000000, maxPrice: 2000000 },
    };
    return priceLimits[value] || { minPrice: 0, maxPrice: 0 };
  }

  function fetchAndDisplaySSDData(value, diskSize) {
    const ssdRef = db.ref("부품/0/SSD");
    ssdRef.once("value", (snapshot) => {
        const ssds = snapshot.val();
        if (ssds) {
            const { minPrice, maxPrice } = getSSDPriceLimitsByValue(value);
            const filteredSsds = Object.values(ssds).filter((ssd) => {
                const ssdPrice = parseInt(String(ssd["가격"]).replace(/,/g, ""), 10);
                let isDiskSizeMatch = false;

                if (diskSize === "0") {
                    // "0" 선택 시 1TB로 고정
                    isDiskSizeMatch = isCorrectDiskSize(ssd["저장용량"], "3");
                } else {
                    isDiskSizeMatch = isCorrectDiskSize(ssd["저장용량"], diskSize);
                }

                return ssdPrice >= minPrice && ssdPrice <= maxPrice && isDiskSizeMatch;
            });

            if (filteredSsds.length > 0) {
                const randomSsds = getRandomElements(filteredSsds, 4);
                displayData(randomSsds, "ssd");
            } else {
                recommendationResult.innerHTML = "<p>적합한 SSD를 찾을 수 없습니다.</p>";
            }
        } else {
            recommendationResult.innerHTML = "<p>SSD 데이터를 불러올 수 없습니다.</p>";
        }
    });
}
function fetchAndDisplayHDDData(value, hddSize) {
  const hddRef = db.ref("부품/0/HDD");
  hddRef.once("value", (snapshot) => {
    const hdds = snapshot.val();
    if (hdds) {
      const { minPrice, maxPrice } = getHDDPriceLimitsByValue(value);
      const filteredHdds = Object.values(hdds).filter((hdd) => {
        const hddPrice = parseInt(String(hdd["가격"]).replace(/,/g, ""), 10);
        let ishddSizeMatch = false;

        if (hddSize === "0") {
          ishddSizeMatch = true;
        } else {
          ishddSizeMatch = isCorrectHDDSize(hdd["용량"], hddSize);
        }

        return hddPrice >= minPrice && hddPrice <= maxPrice && ishddSizeMatch;
      });

      if (filteredHdds.length > 0 || hddSize === "0") {
        if (hddSize === "0") {
          displayNoHDDOption();
        } else {
          const randomHdds = getRandomElements(filteredHdds, 4);
          displayData(randomHdds, "hdd");
        }
      } else {
        recommendationResult.innerHTML = "<p>적합한 하드 디스크를 찾을 수 없습니다.</p>";
      }
    } else {
      recommendationResult.innerHTML = "<p>하드 디스크 데이터를 불러올 수 없습니다.</p>";
    }
  });
}

function displayNoHDDOption() {
  document.getElementById("hdd1").textContent = "HDD 선택 안함";
  document.getElementById("hdd2").textContent = "HDD 선택 안함";
  document.getElementById("hdd3").textContent = "HDD 선택 안함";
  document.getElementById("hdd4").textContent = "HDD 선택 안함";

  document.getElementById("hddPrice1").textContent = "0 원";
  document.getElementById("hddPrice2").textContent = "0 원";
  document.getElementById("hddPrice3").textContent = "0 원";
  document.getElementById("hddPrice4").textContent = "0 원";
}

function getHDDPriceLimitsByValue(value) {
  const priceLimits = {
    0: { minPrice: 0, maxPrice: 140000 },
    1: { minPrice: 0, maxPrice: Infinity },
    2: { minPrice: 0, maxPrice: Infinity },
    3: { minPrice: 0, maxPrice: Infinity },
    4: { minPrice: 0, maxPrice: Infinity }
  };
  return priceLimits[value] || { minPrice: 0, maxPrice: 0 };
}
function isCorrectHDDSize(hddSize, selectedSize) {
  const normalizedHDDSize = hddSize.replace(/\s+/g, '').toUpperCase();

  switch (selectedSize) {
      case "1":
          return ["1TB", "1.8TB"].includes(normalizedHDDSize);
      case "2":
          return ["2TB", "2.4TB"].includes(normalizedHDDSize);
      case "3":
          return ["4TB"].includes(normalizedHDDSize);
      case "4":
          const sizePattern = /(\d+)(TB|GB)/;
          const match = normalizedHDDSize.match(sizePattern);
          if (match && match[2] === "TB") {
              const sizeInTB = parseInt(match[1], 10);
              return sizeInTB >= 5;
          }
          return false;
      default:
          return false;
  }
}

function isCorrectDiskSize(ssdSize, selectedSize) {
  const normalizedSSDSize = ssdSize.replace(/\s+/g, '').toUpperCase();
  switch (selectedSize) {
      case "1":
          return ["250GB", "256GB"].includes(normalizedSSDSize);
      case "2":
          return ["500GB", "512GB"].includes(normalizedSSDSize);
      case "3":
          return normalizedSSDSize === "1TB";
      case "4":
          return normalizedSSDSize === "2TB";
      case "5":
          return ["4TB", "5TB"].includes(normalizedSSDSize);
      case "6":
          const sizePattern = /(\d+)(TB|GB)/;
          const match = normalizedSSDSize.match(sizePattern);
          if (match && match[2] === "TB") {
              const sizeInTB = parseInt(match[1], 10);
              return sizeInTB >= 5;
          }
          return false;
      default:
          return false;
  }
}

function getSSDPriceLimitsByValue(value) {
    const priceLimits = {
        "0": { minPrice: 0, maxPrice: 140000 },
        "1": { minPrice: 0, maxPrice: 150000 },
        "2": { minPrice: 0, maxPrice: Infinity },
        "3": { minPrice: 0, maxPrice: Infinity },
        "4": { minPrice: 0, maxPrice: Infinity },
        "5": { minPrice: 0, maxPrice: Infinity },
        "6": { minPrice: 0, maxPrice: Infinity }
    };
    return priceLimits[value] || { minPrice: 0, maxPrice: 0 };
}

function fetchAndDisplayPowerData(value, isInternalGraphics) {
  const powerRef = db.ref("부품/0/Power");
  powerRef.once("value", (snapshot) => {
  const powers = snapshot.val();
  let filteredPowers;
  if (powers) {
    let filteredPowers;
    if (socketMemorySpecs.some((spec) => spec.innerGraphic === "O") && value === "0") {
      filteredPowers = Object.values(powers).filter((power) => power["파워용량"] === 600);
    } else if (socketMemorySpecs.some((spec) => spec.innerGraphic === "O") && value === "1") {
      filteredPowers = Object.values(powers).filter((power) => power["파워용량"] === 700);
    } else if ((socketMemorySpecs.some((spec) => spec.innerGraphic === "O") || socketMemorySpecs.some((spec) => spec.innerGraphic === "x")) && (value === "2" || value ==="3" || value === "4" || value === "5" || value === "6")) {
      const filteredSpecPowers = powerSpecs.map(spec => spec.power + 50);
      filteredPowers = Object.values(powers).filter((power) => {
        const powerRating = parseInt(power["파워용량"]);
        return filteredSpecPowers.includes(powerRating);
      });
    } else {
      const { powerminPrice, powermaxPrice } = getPowerPriceLimitsByValue(value);
      filteredPowers = Object.values(powers).filter((power) => {
        const powerPrice = parseInt(power["가격"]);
        return powerPrice >= powerminPrice && powerPrice <= powermaxPrice;
      });
    }

    if (filteredPowers.length > 0) {
      const randomPowers = getRandomElements(filteredPowers, 4);
      displayData(randomPowers, "power");
    } else {
      recommendationResult.innerHTML = "<p>적합한 파워를 찾을 수 없습니다.</p>";
    }
  } else {
    recommendationResult.innerHTML = "<p>파워 데이터를 불러올 수 없습니다.</p>";
  }
  });
}

function getPowerPriceLimitsByValue(value) {
  const powerPriceLimits = {
    "0": { powerminPrice: 60000, powermaxPrice: 100000 },
    "1": { powerminPrice: 80000, powermaxPrice: 100000 },
    "2": { powerminPrice: 60000, powermaxPrice: 100000 },
    "3": { powerminPrice: 60000, powermaxPrice: 100000 },
    "4": { powerminPrice: 80000, powermaxPrice: 100000 },
    "5": { powerminPrice: 100000, powermaxPrice: 200000 },
    "6": { powerminPrice: 100000, powermaxPrice: 300000 },
  };
  return powerPriceLimits[value] || { powerminPrice: 0, powermaxPrice: 0 };
}

function fetchAndDisplayCaseData(value) {
  const caseRef = db.ref("부품/0/Case");
  caseRef.once("value", (snapshot) => {
    const cases = snapshot.val();
    if (cases) {
      const { minPrice, maxPrice } = getCasePriceLimitsByValue(value);
      const filteredCases = Object.values(cases).filter((caseItem) => {
        const casePrice = parseInt(caseItem["가격"]);
        return casePrice >= minPrice && casePrice <= maxPrice;
      });

      if (filteredCases.length > 0) {
        const randomCases = getRandomElements(filteredCases, 4);
        displayData(randomCases, "case");
      } else {
        recommendationResult.innerHTML = "<p>적합한 케이스를 찾을 수 없습니다.</p>";
      }
    } else {
      recommendationResult.innerHTML = "<p>케이스 데이터를 불러올 수 없습니다.</p>";
    }
  });
}

function getCasePriceLimitsByValue(value) {
  const priceLimits = {
    "0": { minPrice: 20000, maxPrice: 50000 },
    "1": { minPrice: 25000, maxPrice: 90000 },
    "2": { minPrice: 25000, maxPrice: 50000 },
    "3": { minPrice: 26000, maxPrice: 60000 },
    "4": { minPrice: 30000, maxPrice: 70000 },
    "5": { minPrice: 35000, maxPrice: 100000 },
    "6": { minPrice: 60000, maxPrice: Infinity }
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
          itemElement.textContent = item["이름"] || item["Name"];
          const itemPrice = parseInt(String(item["가격"]).replace(/,/g, ""), 10);
          itemPriceElement.textContent = `${itemPrice}원`;
          totalCosts[index] += itemPrice;
        } else {
          itemElement.textContent = `적합한 ${type === "cpu" ? "CPU" : type === "cooler" ? "쿨러" : type === "ram" ? "램" : type === "mboard" ? "메인보드" : type === "SSD" ? "SSD" : type === "HDD" ? "HDD" : type === "Power" ? "Power" : "case"}를 찾을 수 없습니다.`;
          itemPriceElement.textContent = "";
        }
      } else {
        console.error(`Element with ID ${element.name} or ${element.price} not found.`);
      }
    });
    for (let i = items.length; i < 4; i++) {
      const itemElement = document.getElementById(`${type}${i + 1}`);
      const itemPriceElement = document.getElementById(`${type}Price${i + 1}`);

      if (itemElement && itemPriceElement) {
        itemElement.textContent = `적합한 ${type === "cpu" ? "CPU" : type === "cooler" ? "쿨러" : type === "ram" ? "램" : type === "mboard" ? "메인보드" : type === "SSD" ? "SSD" : type === "HDD" ? "HDD" : type === "Power" ? "Power" : "case"}를 찾을 수 없습니다.`;
        itemPriceElement.textContent = "";
      } else {
        console.error(`Element with ID ${type}${i + 1} or ${type}Price${i + 1} not found.`);
      }
    }

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
