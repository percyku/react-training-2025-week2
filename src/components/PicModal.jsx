const PicModal = ({ modalRef, photoUrl }) => {
  return (
    <div className="modal fade" tabIndex="-1" ref={modalRef}>
      <div className="modal-dialog">
        <div className="modal-content d-flex align-items-center ">
          <div>
            <img src={photoUrl} alt="" width="100%" height="100%" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PicModal;
