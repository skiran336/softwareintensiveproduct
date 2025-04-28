import CompareSIPs from '../../components/compareSIP/compareSIPs';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';

const ComparePage = () => {
  return (
    <><Header />
    <div className="compare-page">
          <CompareSIPs />
      </div>
      <Footer />
      </>
  );
};


export default ComparePage;