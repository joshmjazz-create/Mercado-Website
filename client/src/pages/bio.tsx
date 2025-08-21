export default function Bio() {
  return (
    <section className="min-h-screen bg-gradient-to-br from-jazz-cream via-white to-jazz-cream">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-800 mb-6">Biography</h1>
          <div className="w-24 h-1 bg-purple-800 mx-auto"></div>
        </div>

        <div className="max-w-4xl mx-auto opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
          <div className="bg-white rounded-lg shadow-lg p-8 md:p-12">
            <div className="prose prose-base max-w-none text-gray-700 leading-relaxed space-y-6">
              <p className="opacity-0 translate-y-4 animate-in" style={{ animationDelay: '600ms' }}>
                Joshua Mercado is a young, up and coming trumpet player based in New Jersey. Raised in Central Florida, he earned his Bachelor's degree in Jazz Studies from the University of Central Florida and is currently pursuing a Master's degree at William Paterson University, where he studies with renowned trumpeter Jeremy Pelt.
              </p>
              
              <p className="opacity-0 translate-y-4 animate-in" style={{ animationDelay: '800ms' }}>
                Mercado moved into the New York City area in 2024 where he quickly started getting his name out and onto the scene. He regularly performs with Winard Harper and the Jeli Posse, having played at venues such as The Bean Runner and Martha's Vineyard in Massachusetts. Other notable musicians he's played with throughout his young career are Joy Brown, Rodney Green, Mike Lee, and Clarence Penn, performing at some of the top clubs in the city such as Smalls and Dizzy's Jazz Club.
              </p>
              
              <p className="opacity-0 translate-y-4 animate-in" style={{ animationDelay: '1000ms' }}>
                His versatility as a musician has also led him to national touring opportunities. In 2024, he went on the road with Joey Fatone (*NSYNC) and AJ McLean (Backstreet Boys) on their <em>A Legendary Night</em> tour, performing at historic venues such as The Ryman, The Factory, and The MGM Grand National Harbor. Through his connection with Joey Fatone, he has shared the stage with other celebrities, including but not limited to Debbie Gibson, Lance Bass, Chris Kirkpatrick, Montell Jordan, Shawn Stockman, Wanya Morris, and even Murr from <em>Impractical Jokers</em>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
