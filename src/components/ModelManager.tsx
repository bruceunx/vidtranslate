import { AiOutlineDelete, AiOutlineDownCircle } from 'react-icons/ai';
import { ModelDetail, UpdateModel } from '../types';
import { useSettingData } from '../store/SettingContext';

interface SingleModelProps {
  model: ModelDetail;
  modelType: string;
}

const SingleModel = ({ model, modelType }: SingleModelProps) => {
  const { updateModel } = useSettingData();

  const onDownload = () => {
    console.log('download');
  };

  const onDelete = () => {
    const newModel = {
      model_type: modelType,
      name: model.name,
      downloadLink: '',
    } as UpdateModel;
    updateModel(newModel);
  };

  return (
    <tr className="flex flex-row justify-between py-2 px-3 items-center">
      <td className="">
        <div className="text-sm font-medium">{model.name}</div>
        <div className="text-sm text-gray-400">{model.description}</div>
      </td>

      <td className="">
        {model.localPath === '' ? (
          <button onClick={onDownload}>
            <AiOutlineDownCircle className="text-green-600 w-5 h-5" />
          </button>
        ) : (
          <button onClick={onDelete}>
            <AiOutlineDelete className="text-red-600 w-5 h-5" />
          </button>
        )}
      </td>
    </tr>
  );
};

interface ModelManagerProps {
  models: ModelDetail[];
  modelType: string;
}

const ModelManager = ({ models, modelType }: ModelManagerProps) => {
  return (
    <div className="bg-custome-gray-focus shadow-md rounded-lg overflow-hidden">
      <table className="min-w-full border border-gray-500">
        <tbody className="divide-y divide-gray-600">
          {models.map((model, index) => (
            <SingleModel key={index} model={model} modelType={modelType} />
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ModelManager;
