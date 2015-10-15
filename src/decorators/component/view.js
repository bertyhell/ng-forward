import {componentWriter, appWriter} from '../../writers';
import {Injectables} from '../injectables';

export const View = config => t => {
	if(config.templateUrl)
	{
		if(componentWriter.has('template', t))
		{
			componentWriter.set('template', undefined, t);
		}

		componentWriter.set('templateUrl', config.templateUrl, t);
	}
	else if(config.template)
	{
		if(componentWriter.has('templateUrl', t))
		{
			componentWriter.set('templateUrl', undefined, t);
		}

		componentWriter.set('template', config.template, t);
	}

	if(config.directives){
		Injectables(...config.directives)(t);
	}
};
