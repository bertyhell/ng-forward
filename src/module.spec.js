import {sinon} from './tests/frameworks';
import {angular, ngMocks} from './tests/angular';
import {providerWriter, baseWriter} from './writers';
import Module from './module';

const provider = (type, name) => t => {
	providerWriter.set('type', type, t);
	providerWriter.set('name', name, t);
};

describe('Decorator Supported Module', function(){
	it('should let you create an Angular module', function(){
		let module = Module('test', []);

		module.should.be.defined;
		angular.module.should.have.been.called;
	});

	it('should let you publish the module to gain access to the ng module', function(){
		Module('test', []).publish().should.eql(ngMocks);
	});

	it('should let you config the module', function(){
		let config = ['$q', () => {}];
		Module('test', []).config(config);

		ngMocks.config.should.have.been.calledWith(config);
	});

	it('should let you create a run function', function(){
		let run = ['$q', () => {}];
		Module('test', []).run(run);

		ngMocks.run.should.have.been.calledWith(run);
	});

	describe('Adding providers', function(){
		let exampleRegister;

		beforeEach(function(){
			exampleRegister = sinon.spy();
			Module.addProvider('example', exampleRegister);
		});

		it('should let you add providers', function(){
			@provider('example', 'A')
			class A{ }

			let mod = Module('test', []).add(A);

			exampleRegister.should.have.been.calledWith(A, 'A', [], mod.publish());
		});

		it('should let you add multiple providers', function(){
			@provider('example', 'A')
			class A{ }

			@provider('example', 'B')
			class B{ }

			@provider('example', 'C')
			class C{ }

			Module('test', []).add(A, B, C);

			exampleRegister.should.have.been.calledThrice;
		});

		it('should throw an error if you add provider with no decorators', function(){
			class A{ }

			let test = () => Module('test', []).add(A);

			test.should.throw(Error, /Cannot read provider/);
		});

		it('should throw an error when adding a provider with an unrecognized type', function(){
			@provider('dne', 'A')
			class A{ }

			let test = () => Module('test', []).add(A);

			test.should.throw(Error, /No parser registered/);
		});
	});
});