
// Variable global para almacenar el costo adicional por zona
let globalZoneCost = 0;

export const setGlobalZoneCost = (cost: number) => {
  globalZoneCost = cost;
  console.log('Global zone cost set to:', cost);
};

export const getGlobalZoneCost = (): number => {
  return globalZoneCost;
};

export const resetGlobalZoneCost = () => {
  globalZoneCost = 0;
};
