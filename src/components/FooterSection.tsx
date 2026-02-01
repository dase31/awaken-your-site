const FooterSection = () => {
  return (
    <footer className="py-16 px-6">
      <div className="max-w-3xl mx-auto text-center">
        <div className="bg-card/20 backdrop-blur-sm rounded-3xl p-8 md:p-12">
          <p className="text-foreground/90 leading-relaxed">
            As a company, Waking Up strives to help alleviate human suffering on many fronts. 
            To that end, we donate a minimum of 10% of our profits to the most effective 
            charities, under the guidance of{" "}
            <a href="https://www.givingwhatwecan.org/" className="underline hover:no-underline">
              Giving What We Can
            </a>
            ,{" "}
            <a href="https://www.givewell.org/" className="underline hover:no-underline">
              Give Well
            </a>
            ,{" "}
            <a href="https://founderspledge.com/" className="underline hover:no-underline">
              Founder's Pledge
            </a>
            , and{" "}
            <a href="https://www.longview.org/" className="underline hover:no-underline">
              Longview Philanthropy
            </a>
            .
          </p>
          <p className="text-foreground/90 mt-6 leading-relaxed">
            Also, if you would like to become a member but truly cannot afford it,{" "}
            <a href="#" className="underline hover:no-underline">
              click here to learn about our scholarship program.
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
