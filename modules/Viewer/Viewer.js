import AbstractModule from '#abstractModule';
import viewer from 'prismarine-viewer';

export default class Viewer extends AbstractModule {
  load () {
    viewer.mineflayer(app().getClient(), { port: 8080, firstPerson: false });
  }

  unload () {
    app().getClient().viewer.close();
  }
}
