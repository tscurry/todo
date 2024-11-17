import { ListProps } from '../utils/types';

const Lists = (props: ListProps) => {
  return (
    <div
      className={`${props.selectedList === props.list.list_id ? 'bg-grey' : ''} transition-all duration-300 flex justify-between items-center p-2 xlmd:p-3 rounded-lg cursor-pointer mb-[8px] xlmd:mb-[6px]`}
    >
      <div className="flex items-center">
        <div
          style={{ borderColor: props.list.color }}
          className={`transition-all rounded-[7px] border-[2px] p-[10px]`}
        ></div>
        <p className="ml-3 text-sm xlmd:text-[16px]">{props.list.name}</p>
      </div>

      <p
        className={`${props.selectedList === props.list.list_id ? 'bg-white' : ''} transition-all duration-300 bg-grey p-1 rounded-lg text-center text-sm w-9`}
      >
        {props.list.item_count}
      </p>
    </div>
  );
};

export default Lists;
