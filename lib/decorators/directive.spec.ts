import {expect, sinon} from '../tests/frameworks';
import {ng} from '../tests/angular';
import {providerStore, componentStore} from '../writers';
import {providers} from '../testing/providers';
import {quickFixture} from '../tests/utils';
import {Inject} from './inject';
import {Directive} from './directive';

describe('@Directive Decorator', function(){

  describe('Decorator', () => {
    it('should set the correct provider metadata', function(){
      @Directive({ selector: '[my-directive]' })
      class MyDirectiveCtrl{ }

      providerStore.get('type', MyDirectiveCtrl).should.eql('directive');
      providerStore.get('name', MyDirectiveCtrl).should.eql('myDirective');
    });

    it('should restrict the directive type', function(){
      @Directive({ selector: '[attr]' })
      class AttrCtrl{ }

      componentStore.get('restrict', AttrCtrl).should.eql('A');
    });

    it('throws an error for if providers are not an array', () => {
      expect(() => {
        @Directive({ selector: '[foo]',
          providers: 'whatever'
        })
        class Foo {}
      }).to.throw(/Directive providers must be an array/);
    });

    it('throws an error for invalid provider', () => {
      class InvalidDueToNoAnnotations {}

      expect(() => {
        @Directive({ selector: '[foo]',
          providers: [InvalidDueToNoAnnotations]
        })
        class Foo {}
      }).to.throw(/while analyzing Directive 'Foo' providers/);
    });
  });

  describe('Angular Integration', () => {

    let angular, fixture;

    beforeEach(() => {
      angular = ng.useReal();
    });

    it('should throw an error if the selector is not an element', () => {
      expect(() => {
        @Directive({ selector: '[my-attr-directive]' })
        class MyClass{ }
        quickFixture({directives: [MyClass]});
      }).not.to.throw(Error);

      expect(() => {
        @Directive({ selector: 'my-attr' })
        class MyClass{ }
        quickFixture({directives: [MyClass]});
      }).to.throw('Processing "MyClass" in "test.module": ' +
          "@Directive selectors can only be attributes, e.g. selector: '[my-directive]'");

      expect(() => {
        @Directive({ selector: '.my-class' })
        class MyClass{ }
        quickFixture({directives: [MyClass]});
      }).to.throw('Processing "MyClass" in "test.module": ' +
          "@Directive selectors can only be attributes, e.g. selector: '[my-directive]'");
    });

    it('should make $scope available as local', () => {
      @Directive({ selector: '[change-foo]' })
      @Inject('$scope')
      class ChangeFoo {
        constructor($scope) {
          $scope.foo = 10;
        }
      }

      fixture = quickFixture({directives: [ChangeFoo], template: '<div ng-init="foo=5" change-foo>{{foo}}</div>'});
      fixture.debugElement.find('div').text().should.eql('10');
    });

    it('should make $element available as local', () => {
      @Directive({ selector: '[is-dumb]' })
      @Inject('$element')
      class IsDumb {
        constructor($element) {
          $element.addClass('is-dumb');
        }
      }

      fixture = quickFixture({directives: [IsDumb], template: '<div is-dumb></div>'});
      fixture.debugElement.find('div').hasClass('is-dumb').should.be.true;
    });

    it('should make $attr available as local', () => {
      @Directive({ selector: '[attr-count]' })
      @Inject('$attrs')
      class AttrCount {
        constructor($attrs) {
          $attrs.$set('attrCount', Object.keys($attrs.$attr).length);
        }
      }

      fixture = quickFixture({directives: [AttrCount], template: '<div foo bar baz attr-count></div>'});
      fixture.debugElement.find('div').attr('attr-count').should.eql('4');
    });
  });

});
