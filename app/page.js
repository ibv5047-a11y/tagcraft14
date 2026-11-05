import Header from '@/components/Header';
import Footer from '@/components/Footer';

const SAMPLE_TAGS = [
  'handmade mug',
  'ceramic coffee mug',
  'stoneware cup',
  'pottery gift',
  'blue speckled mug',
  'coffee lover gift',
  'housewarming gift',
  '12 oz mug',
  'wheel thrown mug',
  'kitchen decor',
  'tea cup handmade',
  'artisan pottery',
  'birthday gift',
];

export default function Home() {
  return (
    <>
      <Header />
      <main id="top">
        <section className="hero wrap" aria-labelledby="hero-title">
          <div>
            <h1 id="hero-title">Listings that shoppers can actually find.</h1>
            <p className="pitch">
              TagCraft uses AI to write search-optimized titles, tags, and descriptions for your Etsy and
              ecommerce product listings in seconds.
            </p>
            <a className="button" href="#what-it-does">See what it does</a>
          </div>

          <figure className="listing" aria-label="Example of a listing before and after TagCraft">
            <div className="listing-before">
              <h2>Your title now</h2>
              <p>Blue Mug</p>
            </div>
            <div className="listing-after">
              <h2>Your title with TagCraft</h2>
              <p className="title">
                Handmade Ceramic Coffee Mug, Speckled Blue Stoneware Cup, 12 oz Pottery Gift for Coffee Lovers
              </p>
              <ul className="tags" aria-label="Suggested tags">
                {SAMPLE_TAGS.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="listing-note">Sample output. Etsy allows 13 tags of up to 20 characters each.</p>
            </div>
          </figure>
        </section>

        <section className="what" id="what-it-does" aria-labelledby="what-title">
          <div className="wrap">
            <h2 id="what-title">Describe your product. TagCraft writes the listing.</h2>
            <div className="benefits">
              <div className="benefit">
                <h3>Get found in search</h3>
                <p>Titles built around the words shoppers type, so your product shows up for the searches that matter.</p>
              </div>
              <div className="benefit">
                <h3>Fill every tag slot</h3>
                <p>A full set of relevant tags, sized to fit marketplace limits, with no more staring at an empty field.</p>
              </div>
              <div className="benefit">
                <h3>Descriptions that sell</h3>
                <p>Clear, readable product descriptions that work for search and for the person deciding whether to buy.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
