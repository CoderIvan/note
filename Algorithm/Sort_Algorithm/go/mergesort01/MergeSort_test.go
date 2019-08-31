package main

import (
	"reflect"
	"testing"
)

func Test_merge(t *testing.T) {
	type args struct {
		a []int
		b []int
	}
	tests := []struct {
		name string
		args args
		want []int
	}{
		// TODO: Add test cases.
		{
			name: "01",
			args: args{
				a: []int{1, 4, 5, 7},
				b: []int{2, 3, 11, 23, 45},
			},
			want: []int{1, 2, 3, 4, 5, 7, 11, 23, 45},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := merge(tt.args.a, tt.args.b); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("merge() = %v, want %v", got, tt.want)
			}
		})
	}
}

func Test_mergePass(t *testing.T) {
	type args struct {
		ab []int
	}
	tests := []struct {
		name string
		args args
		want []int
	}{
		// TODO: Add test cases.
		{
			name: "01",
			args: args{
				ab: []int{1, 4, 5, 7, 2, 3, 11, 23, 45},
			},
			want: []int{1, 2, 3, 4, 5, 7, 11, 23, 45},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := mergePass(tt.args.ab); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("mergePass() = %v, want %v", got, tt.want)
			}
		})
	}
}
