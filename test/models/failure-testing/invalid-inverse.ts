
import { attr, belongsTo, hasMany, Model, ModelOrPromise, Schema } from '../../../src';
import { Bad } from '../../models';

export class InvalidInverse extends Model {

    public static modelName: string = 'bad';
    public static modelPath: string = 'bads';

    public schema: Schema = {

        invalidKey: belongsTo(Bad, { inverse: 'an-invalid-key' }),
        invalidType: belongsTo(Bad, { inverse: 'aNumber' }),
        badHandlerOnInverse: belongsTo(Bad, { inverse: 'badHandler' }),
    };

    public invalidKey: ModelOrPromise<Bad> | null = null;
    public invalidType: ModelOrPromise<Bad> | null = null;
    public badHandlerOnInverse: ModelOrPromise<Bad> | null = null;

}

