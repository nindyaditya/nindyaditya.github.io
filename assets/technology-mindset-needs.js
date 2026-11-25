
(() => {
  const examples = [
    {name: 'ADHD', quote: 'Could I have the instructions one step at a time?', support: 'Clear, manageable steps and written directions to refer back to.', source: 'https://chadd.org/for-educators/classroom-accommodations/', label: 'CHADD'},
    {name: 'Autism', quote: 'Could you tell me what happens after this activity?', support: 'A clear preview of the sequence and advance notice of changes.', source: 'https://www.autism.org.uk/advice-and-guidance/topics/education', label: 'National Autistic Society'},
    {name: 'Dyslexia', quote: 'Could I listen to the instructions as well as read them?', support: 'An audio option alongside written instructions and time to read.', source: 'https://www.bdadyslexia.org.uk/advice/educators/what-do-i-need-to-know/reasonable-adjustments', label: 'British Dyslexia Association'},
    {name: 'Dyscalculia', quote: 'Could we show these amounts with objects?', support: 'Concrete materials and visual representations when exploring quantities.', source: 'https://www.bdadyslexia.org.uk/dyscalculia', label: 'British Dyslexia Association'},
    {name: 'Dysgraphia', quote: 'Could I type my answer?', support: 'An alternative way to record an answer when handwriting is a barrier.', source: 'https://www.healthdirect.gov.au/dysgraphia', label: 'Healthdirect'},
    {name: 'Dyspraxia / DCD', quote: 'Could I have more time to write this down?', support: 'Time for written work and tools suited to the student’s motor needs.', source: 'https://www.nhs.uk/conditions/developmental-coordination-disorder-dyspraxia/treatment/', label: 'NHS'},
    {name: 'Developmental language disorder', quote: 'Could you say that again in shorter parts?', support: 'Short instructions, visual support, and time to process spoken language.', source: 'https://www.nidcd.nih.gov/health/developmental-language-disorder', label: 'NIDCD'},
    {name: 'Tourette syndrome', quote: 'Could I take a short break when I need one?', support: 'An agreed way to take breaks and a classroom that understands tics.', source: 'https://www.cdc.gov/tourette-syndrome/education/index.html', label: 'CDC'}
  ];
  const root = document.querySelector('.needs-explorer');
  if (!root) return;
  const desks = root.querySelector('.needs-desks');
  const card = root.querySelector('.needs-card');
  let active = 0;
  const buttons = examples.map((item, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'needs-desk';
    button.textContent = item.name;
    button.addEventListener('click', () => select(i));
    desks.append(button);
    return button;
  });
  function select(index) {
    active = (index + examples.length) % examples.length;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === active)));
    const item = examples[active];
    card.replaceChildren();
    const quote = document.createElement('p');
    quote.className = 'needs-quote';
    quote.textContent = '“' + item.quote + '”';
    const support = document.createElement('p');
    support.className = 'needs-support';
    support.textContent = 'Possible support: ' + item.support;
    card.append(quote, support);
    root.querySelector('.needs-count').textContent = (active + 1) + ' / ' + examples.length;
    window.dispatchEvent(new Event('resize'));
  }
  root.querySelector('.needs-prev').addEventListener('click', () => select(active - 1));
  root.querySelector('.needs-next').addEventListener('click', () => select(active + 1));
  root.addEventListener('keydown', event => {
    if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
    event.stopPropagation();
    event.preventDefault();
    select(active + (event.key === 'ArrowRight' ? 1 : -1));
  });
  select(0);
})();
