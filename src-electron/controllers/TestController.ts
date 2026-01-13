import testService from '../services/TestService';

class TestController {
  index() {
    return testService.getTestData();
  }
}

export default new TestController();
