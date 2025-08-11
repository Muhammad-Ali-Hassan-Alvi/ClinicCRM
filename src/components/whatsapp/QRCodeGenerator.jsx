import QRCode from 'qrcode';

const QRCodeGenerator = ({ numberId }) => {
 
  // Construct the official 'wa.me' link
  const waLink = `https://wa.me/${numberId}`;

  return (
    <div className="flex justify-center">
      <QRCode
        value={waLink}
        size={200}
        level={"H"}
        includeMargin={true}
      />
    </div>
  );
};

export default QRCodeGenerator;