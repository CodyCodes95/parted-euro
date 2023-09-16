import type { Car, Image, Listing, Part, PartDetail } from "@prisma/client";
import Modal from "../modals/ModalNew";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type AdminListingQuery = Listing & {
  parts: (Part & {
    partDetails: PartDetail & {
      cars: Car[];
    };
  })[];
  images: Image[];
};

type MarkAsSoldProps = {
  isOpen: boolean;
  onClose: () => void;
  listing: AdminListingQuery;
  title: string;
};

const MarkAsSold = ({ isOpen, onClose, listing, title }: MarkAsSoldProps) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="grid grid-cols-2 gap-4">
        {listing.parts.map((part) => (
          <>
            <p>{part.partDetails.name}</p>
            <Select>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Quantity" />
              </SelectTrigger>
              <SelectContent>
                {Array.from(Array(part.quantity).keys()).map((i) => (
                  <SelectItem key={i} value={(i + 1).toString()}>
                    {(i + 1).toString()}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        ))}
      </div>
    </Modal>
  );
};

export default MarkAsSold;
