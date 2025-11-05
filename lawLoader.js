window.LawLoader = class LawLoader {
  constructor() {
    this.laws = {
      bdg: { name: 'Beamtendienstgesetz', content: '', loaded: false },
      oeg: { name: 'Öffentliches Gesetzbuch', content: '', loaded: false },
      jbg: { name: 'Justizbeitreibungsgesetz', content: '', loaded: false },
      gvg: { name: 'Gerichtsverfassungsgesetz', content: '', loaded: false }
    };
    this.loaded = false;
  }

  async loadAll() {
    const lawKeys = Object.keys(this.laws);
    const promises = lawKeys.map(async key => {
      try {
        const response = await fetch(`./${key}.txt`);
        if (!response.ok) throw new Error(`${key}.txt konnte nicht geladen werden`);
        const text = await response.text();
        this.laws[key].content = text;
        this.laws[key].loaded = true;

        console.log(`${key}.txt geladen`);
        // Optional: Statusanzeige
        const indicator = document.getElementById(`${key}-indicator`);
        if (indicator) indicator.style.backgroundColor = 'lime';
      } catch (err) {
        console.error(err);
        const indicator = document.getElementById(`${key}-indicator`);
        if (indicator) indicator.style.backgroundColor = 'red';
      }
    });

    await Promise.all(promises);
    this.loaded = lawKeys.every(k => this.laws[k].loaded);
    return this.loaded;
  }

  getAllContent() {
    return Object.entries(this.laws).map(([key, law]) => ({
      key,
      name: law.name,
      content: law.content
    }));
  }
};
