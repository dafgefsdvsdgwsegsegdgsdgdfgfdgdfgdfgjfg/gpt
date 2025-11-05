window.LawSearch = class LawSearch {
  constructor(lawLoader) {
    this.lawLoader = lawLoader;
    this.stopWords = [
      'der','die','das','und','oder','ist','sind','wie','was',
      'zu','mit','auf','für','in','einem','eine','den','dem',
      'des','am','im','an','vom','bei','als','auch','nur','noch',
      'dass','da','als','bei','hat','hatte','wurde'
    ];
  }

  // Levenshtein-Distanz
  levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b[i - 1] === a[j - 1]) matrix[i][j] = matrix[i - 1][j - 1];
        else matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
    return matrix[b.length][a.length];
  }

  // Ähnlichkeit 0..1
  similarity(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    const distance = this.levenshtein(a, b);
    return 1 - distance / Math.max(a.length, b.length);
  }

  // Suche nach Gesetzen, nur bester Treffer
  searchLaws(query) {
    if (!this.lawLoader.loaded) return [];

    const allLaws = this.lawLoader.getAllContent();
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter(w => w.length > 2 && !this.stopWords.includes(w));

    let bestMatch = { score: 0, text: '', lawName: '', title: '' };

    allLaws.forEach(law => {
      const sections = law.content.split(/(?=§\s*\d+)/);
      sections.forEach(section => {
        const sectionLower = section.toLowerCase();
        let score = 0;

        queryWords.forEach(word => {
          // Exakte Treffer
          const regex = new RegExp(word, "g");
          const exactMatches = (sectionLower.match(regex) || []).length;
          score += exactMatches * 5;

          // Fuzzy Matching
          sectionLower.split(/\s+/).forEach(sw => {
            const sim = this.similarity(word, sw);
            if (sim > 0.6) score += sim * 5;
          });

          // Teilwort-Matching
          if (sectionLower.includes(word)) score += 2;

          // Anfang des Abschnitts Bonus
          const idx = sectionLower.indexOf(word);
          if (idx >= 0 && idx < 50) score += 3;
        });

        if (score > bestMatch.score) {
          const firstLine = section.split('\n')[0].trim();
          bestMatch = {
            score,
            text: section.trim(),
            lawName: law.name,
            title: firstLine
          };
        }
      });
    });

    return bestMatch.score > 0 ? [bestMatch] : [];
  }

  // Antwort generieren mit Highlight, nur bester Treffer
  generateAnswer(query, searchResults) {
    if (!searchResults.length) return 'Entschuldigung, ich konnte keine relevanten Informationen in den Gesetzestexten finden.';

    const result = searchResults[0];
    const queryWords = query.toLowerCase().split(/\s+/);
    let highlightedText = result.text;
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    });

    return `<strong>${result.lawName} - ${result.title}</strong><br><br>${highlightedText.replace(/\n/g,'<br>')}`;
  }
};
