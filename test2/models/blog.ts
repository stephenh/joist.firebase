
import { attr, belongsTo, hasMany, Model, ModelOrPromise, Schema, Serializers } from '../../src';
import { Post, User } from '../models';

export class Blog extends Model {

    public static modelName: string = 'blog';
    public static modelPath: string = 'blogs';

    public schema: Schema = {
        name: attr(Serializers.String),
        description: attr(Serializers.String),
        createdDate: attr(Serializers.Date, { defaultValue: (): Date => new Date() }),
        updatedTime: attr(Serializers.Number, { setToServerTimestampOnSave: true }),
        published: attr(Serializers.Boolean),
        featured: attr(Serializers.Boolean),
        ranking: attr(Serializers.Number),
        config: attr(Serializers.JSON),

        owner: belongsTo(User, { inverse: 'blog' }),
        posts: hasMany(Post, { inverse: 'blog' }),
    };

    public name: string = '';
    public description: string | null = null;
    public createdDate: Date = new Date(0);
    public updatedTime: number | null = null;
    public published: boolean = false;
    public featured: boolean = false;
    public ranking: number = 0;
    public config: {} | null = null;

    public owner: ModelOrPromise<User> | null = null;
    public posts: ModelOrPromise<Post>[] = [];
}

