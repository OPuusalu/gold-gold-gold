import { CaseItem } from "../../models/CaseItem.js";


export const aiCases = [
  { 
    id: 1, 
    name: 'Fevur Case', 
    price: 10, 
    image: 'src/assets/cases/ai/fevur.png',
    items: [
      new CaseItem('Boost Pistol', 'src/assets/cases/ai/boostpistol.png', 3, 'COMMON'),
      new CaseItem('Angry Girl Gun', 'src/assets/cases/ai/angrigirl.png', 8, 'UNCOMMON'),
      new CaseItem('Angry Girl Gun', 'src/assets/cases/ai/angrigirl.png', 15, 'RARE'),
      new CaseItem('Pink AWP', 'src/assets/cases/ai/pinkawp.png', 20, 'EPIC'),
      new CaseItem('Red Knife', 'src/assets/cases/ai/rubykarambit.png', 100, 'GOLDEN')
    ]
  },
  {
    id: 2,
    name: 'Dreams & Goodnight Case',
    price: 11,
    image: "src/assets/cases/ai/nightmor.png",
    items: [
      new CaseItem('Boost Pistol', 'src/assets/cases/ai/boostpistol.png', 3, 'COMMON'),
      new CaseItem('Angry Girl Gun', 'src/assets/cases/ai/angrigirl.png', 8, 'UNCOMMON'),
      new CaseItem('Angry Girl Gun', 'src/assets/cases/ai/angrigirl.png', 15, 'RARE'),
      new CaseItem('Pink AWP', 'src/assets/cases/ai/pinkawp.png', 20, 'EPIC'),
      new CaseItem('Red Knife', 'src/assets/cases/ai/rubykarambit.png', 100, 'GOLDEN')
    ]
  },
  {
    id: 3,
    name: 'Sports Case',
    price: 12,
    image: "src/assets/cases/ai/2013sports.png",
    items: [
      new CaseItem('Boost Pistol', 'src/assets/cases/ai/boostpistol.png', 3, 'COMMON'),
      new CaseItem('Angry Girl Gun', 'src/assets/cases/ai/angrigirl.png', 8, 'UNCOMMON'),
      new CaseItem('Angry Girl Gun', 'src/assets/cases/ai/angrigirl.png', 15, 'RARE'),
      new CaseItem('Pink AWP', 'src/assets/cases/ai/pinkawp.png', 20, 'EPIC'),
      new CaseItem('Red Knife', 'src/assets/cases/ai/rubykarambit.png', 100, 'GOLDEN')
    ]
  }
];

export const cases = [
    { 
      id: 1, 
      name: 'Fever Case', 
      price: 10, 
      image: 'src/assets/cases/fever/fever-case.png',
      items: [
        new CaseItem('M4A4 | Choppa', 'src/assets/cases/fever/M4A4Choppa.png', 5, 'MIL-SPEC'),
        new CaseItem('MAG-7 | Resupply', 'src/assets/cases/fever/MAG-7Resupply.png', 5, 'MIL-SPEC'),
        new CaseItem('SSG 08 | Memorial', 'src/assets/cases/fever/SSG08Memorial.png', 5, 'MIL-SPEC'),
        new CaseItem('P2000 | Sure Grip', 'src/assets/cases/fever/P2000SureGrip.png', 5, 'MIL-SPEC'),
        new CaseItem('USP-S | PC-GRN', 'src/assets/cases/fever/USP-SPC-GRN.png', 5, 'MIL-SPEC'),
        new CaseItem('MP9 | Nexus', 'src/assets/cases/fever/MP9Nexus.png', 5, 'MIL-SPEC'),
        new CaseItem('XM1014 | Mockingbird', 'src/assets/cases/fever/XM1014Mockingbird.png', 5, 'MIL-SPEC'),
        new CaseItem('Desert Eagle | Serpent Strike', 'src/assets/cases/fever/DesertEagleSerpentStrike.png', 10, 'RESTRICTED'),
        new CaseItem('Zeus x27 | Tosai', 'src/assets/cases/fever/Zeusx27Tosai.png', 10, 'RESTRICTED'),
        new CaseItem('Nova | Rising Sun', 'src/assets/cases/fever/NovaRisingSun.png', 10, 'RESTRICTED'),
        new CaseItem('Galil AR | Control', 'src/assets/cases/fever/GalilARControl.png', 10, 'RESTRICTED'),
        new CaseItem('P90 | Wave Breaker', 'src/assets/cases/fever/P90WaveBreaker.png', 10, 'RESTRICTED'),
        new CaseItem('AK-47 | Searing Rage', 'src/assets/cases/fever/AK-47SearingRage.png', 25, 'CLASSIFIED'),
        new CaseItem('Glock-18 | Shinobu', 'src/assets/cases/fever/Glock-18Shinobu.png', 25, 'CLASSIFIED'),
        new CaseItem('UMP-45 | K.O. Factory', 'src/assets/cases/fever/UMP-45KOFactory.png', 25, 'CLASSIFIED'),
        new CaseItem('FAMAS | Bad Trip', 'src/assets/cases/fever/FAMASBadTrip.png', 50, 'COVERT'),
        new CaseItem('AWP | Printstream', 'src/assets/cases/fever/AWPPrintstream.png', 50, 'COVERT'),
        new CaseItem('Extraordinary rare item', 'src/assets/rare-item.png', 500, 'GOLD')
      ]
    },        
    {
      id: 2,
      name: 'Dreams & Nightmares Case',
      price: 50,
      image: "src/assets/cases/dreamsAndNightmares/DreamsAndNightmaresCase.png",
      items: [
        new CaseItem('Five-SeveN | Scrawl', 'src/assets/cases/dreamsAndNightmares/Five-SeveN-Scrawl.png', 15, 'MIL-SPEC'),
        new CaseItem('MAC-10 | Ensnared', 'src/assets/cases/dreamsAndNightmares/MAC-10-Ensnared.png', 15, 'MIL-SPEC'),
        new CaseItem('MAG-7 | Foresight', 'src/assets/cases/dreamsAndNightmares/MAG-7-Foresight.png', 15, 'MIL-SPEC'),
        new CaseItem('MP5-SD | Necro Jr.', 'src/assets/cases/dreamsAndNightmares/MP5-SD-NecroJr.png', 15, 'MIL-SPEC'),
        new CaseItem('P2000 | Lifted Spirits', 'src/assets/cases/dreamsAndNightmares/P2000-LiftedSpirits.png', 15, 'MIL-SPEC'),
        new CaseItem('SCAR-20 | Poultrygeist', 'src/assets/cases/dreamsAndNightmares/SCAR-20-Poultrygeist.png', 15, 'MIL-SPEC'),
        new CaseItem('Sawed-Off | Spirit Board', 'src/assets/cases/dreamsAndNightmares/Sawed-Off-SpiritBoard.png', 15, 'MIL-SPEC'),
        new CaseItem('PP-Bizon | Space Cat', 'src/assets/cases/dreamsAndNightmares/PP-Bizon-SpaceCat.png', 30, 'RESTRICTED'),
        new CaseItem('G3SG1 | Dream Glade', 'src/assets/cases/dreamsAndNightmares/G3SG1-DreamGlade.png', 30, 'RESTRICTED'),
        new CaseItem('M4A1-S | Night Terror', 'src/assets/cases/dreamsAndNightmares/M4A1-S-NightTerror.png', 30, 'RESTRICTED'),
        new CaseItem('XM1014 | Zombie Offensive', 'src/assets/cases/dreamsAndNightmares/XM1014-ZombieOffensive.png', 30, 'RESTRICTED'),
        new CaseItem('USP-S | Ticket to Hell', 'src/assets/cases/dreamsAndNightmares/USP-S-TickettoHell.png', 30, 'RESTRICTED'),
        new CaseItem('Dual Berettas | Melondrama', 'src/assets/cases/dreamsAndNightmares/DualBerettas-Melondrama.png', 90, 'CLASSIFIED'),
        new CaseItem('FAMAS | Rapid Eye Movement', 'src/assets/cases/dreamsAndNightmares/FAMAS-RapidEyeMovement.png', 90, 'CLASSIFIED'),
        new CaseItem('MP7 | Abyssal Apparition', 'src/assets/cases/dreamsAndNightmares/MP7-AbyssalApparition.png', 90, 'CLASSIFIED'),
        new CaseItem('AK-47 | Nightwish', 'src/assets/cases/dreamsAndNightmares/AK-47-Nightwish.png', 300, 'COVERT'),
        new CaseItem('MP9 | Starlight Protector', 'src/assets/cases/dreamsAndNightmares/MP9-StarlightProtector.png', 300, 'COVERT'),
        new CaseItem('Exceedingly Rare Special Item', 'src/assets/rare-item.png', 2500, 'GOLD')
      ]
    },
    {
      id: 3,
      name: 'eSports 2013 Case',
      price: 100,
      image: "src/assets/cases/eSports2013/eSports2013Case.png",
      items: [
        new CaseItem('M4A4 | Faded Zebra', 'src/assets/cases/eSports2013/M4A4-FadedZebra.png', 30, 'MIL-SPEC'),
        new CaseItem('MAG-7 | Memento', 'src/assets/cases/eSports2013/MAG-7-Memento.png', 15, 'MIL-SPEC'),
        new CaseItem('FAMAS | Doomkitty', 'src/assets/cases/eSports2013/FAMAS-Doomkitty.png', 20, 'MIL-SPEC'),
        new CaseItem('Galil AR | Orange DDPAT', 'src/assets/cases/eSports2013/GalilAR-OrangeDDPAT.png', 70, 'RESTRICTED'),
        new CaseItem('Sawed-Off | Orange DDPAT', 'src/assets/cases/eSports2013/Sawed-Off-OrangeDDPAT.png', 50, 'RESTRICTED'),
        new CaseItem('P250 | Splash', 'src/assets/cases/eSports2013/P250-Splash.png', 100, 'RESTRICTED'),
        new CaseItem('AK-47 | Red Laminate', 'src/assets/cases/eSports2013/AK-47-RedLaminate.png', 300, 'CLASSIFIED'),
        new CaseItem('AWP | BOOM', 'src/assets/cases/eSports2013/AWP-BOOM.png', 500, 'CLASSIFIED'),
        new CaseItem('P90 | Death by Kitty', 'src/assets/cases/eSports2013/P90-DeathbyKitty.png', 700, 'COVERT'),
        new CaseItem('Exceedingly Rare Special Item', 'src/assets/rare-item.png', 5000, 'GOLD')
      ]
    }
];