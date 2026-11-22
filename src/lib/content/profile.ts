// Who Evan is. Edit here and every page that describes him follows.

// Nav brand, page titles, home H1, JSON-LD name, Markdown/llms.txt headings.
export const PERSON_NAME = 'Evan Gan';

// One-line description: home page hidden intro, JSON-LD description, index.md / llms.txt summary.
// This is how search engines and AI tools will describe you.
export const PERSON_SUMMARY =
	'Robotics Engineering and Computer Science student at WPI who builds software, circuit boards and ' +
	'machines, and organizes hackathons for teens.';

// Bio paragraphs: About page (visible; it appends a "my projects page" link to the first one),
// home hidden intro (first paragraph only), index.md (first) and about.md (all).
export const BIO_PARAGRAPHS = [
	"I'm a Robotics Engineering & Computer Science double major at WPI, and I like building things. " +
		'Mostly software, but also circuit boards, a pen plotter, and once an 8-foot guillotine for smashing pumpkins.',
	'In high school I was on my FIRST Robotics team, where I did a bit of everything, from CAD and design to ' +
		'manufacturing and programming.',
	'I also organize hackathons for teens, which is how I ended up running events from Boston to Berlin.'
];

// Topics: JSON-LD knowsAbout and the home hidden intro's "Topics:" line. Search tools pair the FIRST
// one with your name ("Evan Gan robotics"), so put what you most want to be found for first.
export const KNOWS_ABOUT = [
	'Robotics',
	'Software engineering',
	'Hackathon organizing',
	'Circuit board design',
	'FIRST Robotics'
];

// JSON-LD only (not shown on the page).
export const JOB_TITLE = 'Robotics Engineering & Computer Science student';
export const SCHOOL = { name: 'Worcester Polytechnic Institute', url: 'https://www.wpi.edu' };

// About intro photo (888×1200) and JSON-LD image.
export const PERSON_PHOTO = { src: '/photo-of-me.webp', width: 888, height: 1200 };
